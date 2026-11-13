// Área do desenvolvedor (/dev): só quem tem a chave do desenvolvedor entra (e, por padrão, só do computador que roda o
// servidor). Fica num pacote à parte: quem joga nunca baixa este código.

import { useEffect, useMemo, useState } from 'preact/hooks';
import { ErroApi, pedir, urlArquivo, type AcessoDev, type DecksDev, type ErroCliente, type LinhaDiario, type RelatoCompleto, type RelatoResumo, type Resumo, type SalaDev } from './api.ts';
import './dev.css';

type Aba = 'painel' | 'relatos' | 'erros' | 'servidor' | 'salas' | 'cartas' | 'acesso';
const ABAS: { id: Aba; nome: string }[] = [
  { id: 'painel', nome: 'Painel' },
  { id: 'relatos', nome: 'Relatos de erro' },
  { id: 'erros', nome: 'Erros do navegador' },
  { id: 'servidor', nome: 'Servidor' },
  { id: 'salas', nome: 'Salas' },
  { id: 'cartas', nome: 'Cartas e decks' },
  { id: 'acesso', nome: 'Acesso' },
];

const TIPOS: Record<string, string> = { regra: 'Carta/regra', visual: 'Visual', travou: 'Travou/erro', bot: 'Bot', outro: 'Outro' };
const REPETE: Record<string, string> = { sempre: 'sempre', 'as-vezes': 'às vezes', 'uma-vez': 'uma vez', 'nao-sei': 'não sabe' };

const dataHora = (v: string | number) => new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const hora = (v: string | number) => new Date(v).toLocaleTimeString('pt-BR');
function haQuanto(v: string | number): string {
  const s = Math.round((Date.now() - new Date(v).getTime()) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return `há ${Math.round(s / 60)} min`;
  if (s < 86400) return `há ${Math.round(s / 3600)} h`;
  return `há ${Math.round(s / 86400)} d`;
}
function duracao(s: number): string {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d ? `${d} d ${h} h` : h ? `${h} h ${m} min` : `${m} min`;
}

function lerHash(): { aba: Aba; id: string | null } {
  const [a, id] = location.hash.replace(/^#\/?/, '').split('/');
  return { aba: (ABAS.some((x) => x.id === a) ? a : 'painel') as Aba, id: id || null };
}
const irPara = (aba: Aba, id: string | null = null) => { location.hash = `/${aba}${id ? `/${id}` : ''}`; };

/** pede de tempos em tempos (enquanto a aba do navegador está visível) */
function usePedido<T>(caminho: string, cada: number | null = null): { dados: T | null; erro: string | null; recarregar: () => void } {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    let vivo = true;
    const ir = () => pedir<T>(caminho).then((d) => { if (vivo) { setDados(d); setErro(null); } }).catch((e) => { if (vivo) { setErro(e.message); if (e instanceof ErroApi && e.status === 401) location.reload(); } });
    void ir();
    const t = cada ? setInterval(() => { if (!document.hidden) void ir(); }, cada) : null;
    return () => { vivo = false; if (t) clearInterval(t); };
  }, [caminho, n, cada]);
  return { dados, erro, recarregar: () => setN((x) => x + 1) };
}

async function copiar(texto: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(texto); return true; } catch {
    const t = document.createElement('textarea');
    t.value = texto; document.body.append(t); t.select();
    const ok = document.execCommand('copy'); t.remove(); return ok;
  }
}

function BotaoCopiar({ texto, rotulo = 'Copiar' }: { texto: () => string; rotulo?: string }) {
  const [ok, setOk] = useState(false);
  return <button type="button" class="dev-btn" onClick={async () => { if (await copiar(texto())) { setOk(true); setTimeout(() => setOk(false), 1500); } }}>{ok ? 'Copiado ✓' : rotulo}</button>;
}

// ---------------------------------------------------------------------------
export function Dev() {
  const [sessao, setSessao] = useState<boolean | null>(null);
  const [fechada, setFechada] = useState(false);
  useEffect(() => {
    document.title = 'Desenvolvedor · Magic Commander';
    pedir<{ ok: boolean }>('sessao').then((r) => setSessao(r.ok)).catch((e) => { if (e instanceof ErroApi && e.status === 404) setFechada(true); else setSessao(false); });
  }, []);
  if (fechada) return <div class="dev dev-centro"><div class="dev-cartao"><h1>Página não encontrada</h1><p class="dev-suave"><a href="/">Voltar ao jogo</a></p></div></div>;
  if (sessao === null) return <div class="dev dev-centro"><p class="dev-suave">Carregando…</p></div>;
  if (!sessao) return <Entrar aoEntrar={() => setSessao(true)} />;
  return <Area />;
}

function Entrar({ aoEntrar }: { aoEntrar: () => void }) {
  const [chave, setChave] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const enviar = async (e: Event) => {
    e.preventDefault();
    setEnviando(true); setErro(null);
    try { await pedir('entrar', { chave: chave.trim() }); aoEntrar(); } catch (x) { setErro((x as Error).message); } finally { setEnviando(false); }
  };
  return (
    <div class="dev dev-centro">
      <form class="dev-cartao dev-entrar" onSubmit={enviar}>
        <h1>Área do desenvolvedor</h1>
        <p class="dev-suave">Entre com a chave do desenvolvedor. Ela fica em <code>jogo/dados-locais/senha-dev.txt</code> no computador que roda o servidor (não é a senha do grupo).</p>
        <input type="password" autoComplete="current-password" placeholder="Chave do desenvolvedor" value={chave} onInput={(e) => setChave((e.target as HTMLInputElement).value)} autoFocus />
        {erro && <p class="dev-erro">{erro}</p>}
        <button type="submit" class="dev-btn dev-primario" disabled={enviando || !chave.trim()}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        <a class="dev-suave dev-voltar" href="/">Voltar ao jogo</a>
      </form>
    </div>
  );
}

function Area() {
  const [rota, setRota] = useState(lerHash);
  useEffect(() => { const f = () => setRota(lerHash()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  const { dados: resumo, recarregar } = usePedido<Resumo>('resumo', 10_000);
  useEffect(recarregar, [rota.aba]);
  const contagem: Partial<Record<Aba, number>> = resumo ? { relatos: resumo.relatos.abertos, erros: resumo.errosCliente.abertos, servidor: resumo.servidor.erros1h } : {};
  const sair = async () => { await pedir('sair', {}).catch(() => {}); location.reload(); };
  return (
    <div class="dev">
      <header class="dev-topo">
        <div class="dev-marca"><strong>Magic Commander</strong><span>desenvolvedor</span></div>
        <nav class="dev-abas">
          {ABAS.map((a) => (
            <button type="button" key={a.id} class={rota.aba === a.id ? 'ativa' : ''} onClick={() => irPara(a.id)}>
              {a.nome}{contagem[a.id] ? <span class="dev-selo">{contagem[a.id]}</span> : null}
            </button>
          ))}
        </nav>
        <div class="dev-topo-fim"><a href="/" class="dev-suave">Jogo</a><button type="button" class="dev-btn" onClick={sair}>Sair</button></div>
      </header>
      <main class="dev-conteudo">
        {rota.aba === 'painel' && <Painel resumo={resumo} />}
        {rota.aba === 'relatos' && <Relatos id={rota.id} />}
        {rota.aba === 'erros' && <ErrosNavegador />}
        {rota.aba === 'servidor' && <Servidor />}
        {rota.aba === 'salas' && <Salas />}
        {rota.aba === 'cartas' && <Cartas />}
        {rota.aba === 'acesso' && <Acesso />}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
function Numero({ valor, rotulo, tom, ir }: { valor: string | number; rotulo: string; tom?: 'ruim' | 'atencao' | 'bom'; ir?: () => void }) {
  return (
    <button type="button" class={`dev-numero ${tom ?? ''}`} onClick={ir} disabled={!ir}>
      <span class="dev-numero-valor">{valor}</span>
      <span class="dev-numero-rotulo">{rotulo}</span>
    </button>
  );
}

function Painel({ resumo: r }: { resumo: Resumo | null }) {
  if (!r) return <p class="dev-suave">Carregando…</p>;
  const lag = r.atrasoLacoMs.p99;
  return (
    <div class="dev-pilha">
      <section>
        <h2>O que pede atenção</h2>
        <div class="dev-grade-numeros">
          <Numero valor={r.relatos.abertos} rotulo="relatos abertos" tom={r.relatos.abertos ? 'atencao' : 'bom'} ir={() => irPara('relatos')} />
          <Numero valor={r.errosCliente.abertos} rotulo="erros do navegador abertos" tom={r.errosCliente.abertos ? 'atencao' : 'bom'} ir={() => irPara('erros')} />
          <Numero valor={r.servidor.erros1h} rotulo="erros do servidor na última hora" tom={r.servidor.erros1h ? 'ruim' : 'bom'} ir={() => irPara('servidor')} />
          <Numero valor={r.salas.comErro} rotulo="salas com erro do motor" tom={r.salas.comErro ? 'ruim' : 'bom'} ir={() => irPara('salas')} />
          <Numero valor={r.decks.total - r.decks.jogaveis} rotulo="decks esperando cartas" tom={r.decks.total - r.decks.jogaveis ? 'atencao' : 'bom'} ir={() => irPara('cartas')} />
        </div>
      </section>
      <section>
        <h2>Agora na mesa</h2>
        <div class="dev-grade-numeros">
          <Numero valor={r.salas.pessoasConectadas} rotulo="pessoas em salas" ir={() => irPara('salas')} />
          <Numero valor={r.conexoes} rotulo="conexões abertas" />
          <Numero valor={r.salas.porEstado.jogando ?? 0} rotulo="partidas em andamento" ir={() => irPara('salas')} />
          <Numero valor={r.salas.total} rotulo="salas guardadas" ir={() => irPara('salas')} />
          <Numero valor={`${r.decks.jogaveis}/${r.decks.total}`} rotulo="decks jogáveis" ir={() => irPara('cartas')} />
        </div>
      </section>
      <section>
        <h2>Servidor</h2>
        <dl class="dev-ficha">
          <dt>Versão rodando</dt><dd><code>{r.versao ?? '?'}</code></dd>
          {r.git && <><dt>Pasta</dt><dd>ramo <code>{r.git.ramo}</code>{r.git.alterados ? <span class="dev-tag atencao">{r.git.alterados} arquivo(s) alterado(s) sem commit</span> : <span class="dev-tag bom">sem alterações</span>}{r.git.ultimo && r.versao && r.git.ultimo.split(' ')[0] !== r.versao.split(' ')[0] ? <span class="dev-tag atencao">há commit novo ({r.git.ultimo.split(' ')[0]}): reinicie para usar</span> : null}</dd></>}
          <dt>No ar</dt><dd>{duracao(r.segundosNoAr)} (desde {dataHora(r.iniciadoEm)})</dd>
          <dt>Memória</dt><dd>{r.memoria.rssMB} MB no total · heap {r.memoria.heapMB}/{r.memoria.heapTotalMB} MB</dd>
          <dt>Atraso do laço</dt><dd><span class={lag > 200 ? 'dev-txt-ruim' : lag > 50 ? 'dev-txt-atencao' : ''}>p50 {r.atrasoLacoMs.p50} ms · p99 {r.atrasoLacoMs.p99} ms · máx {r.atrasoLacoMs.max} ms</span> <span class="dev-suave">(nos últimos segundos; acima de 50 ms a mesa começa a engasgar)</span></dd>
          <dt>Node</dt><dd>{r.node} · {r.plataforma} · pid {r.pid}</dd>
          <dt>Último relato</dt><dd>{r.relatos.ultimo ? `${dataHora(r.relatos.ultimo)} (${haQuanto(r.relatos.ultimo)})` : 'nenhum ainda'}</dd>
        </dl>
      </section>
      <section>
        <h2>Atalhos de terminal</h2>
        <div class="dev-comandos">
          {[
            ['Listar relatos', 'node ferramentas/relatos.ts listar'],
            ['Testes', 'npm test'],
            ['Tipos', 'npm run typecheck'],
            ['Cobertura das cartas', 'node ferramentas/cobertura.ts'],
            ['Conferir decks no Moxfield', 'node ferramentas/decks.ts conferir'],
            ['Backup das partidas', 'node ferramentas/backup-partidas.ts'],
          ].map(([n, c]) => <div key={c} class="dev-comando"><span>{n}</span><code>{c}</code><BotaoCopiar texto={() => c} /></div>)}
        </div>
        <p class="dev-suave">Rode dentro da pasta <code>jogo/</code>.</p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
function Relatos({ id }: { id: string | null }) {
  const { dados, erro, recarregar } = usePedido<RelatoResumo[]>('relatos', 30_000);
  const [filtro, setFiltro] = useState<'aberto' | 'resolvido' | 'todos'>('aberto');
  const [tipo, setTipo] = useState('');
  const [busca, setBusca] = useState('');
  const lista = useMemo(() => (dados ?? []).filter((r) =>
    (filtro === 'todos' || r.estado === filtro) && (!tipo || r.tipo === tipo)
    && (!busca || `${r.numero} ${r.oque} ${r.nome} ${r.cartas.join(' ')}`.toLowerCase().includes(busca.toLowerCase()))), [dados, filtro, tipo, busca]);
  // sem um escolhido: o primeiro da lista (na tela larga)
  const escolhido = id ?? null;
  return (
    <div class="dev-dividido">
      <aside class={`dev-lista ${escolhido ? 'com-detalhe' : ''}`}>
        <div class="dev-filtros">
          <div class="dev-segmentos">
            {(['aberto', 'resolvido', 'todos'] as const).map((f) => <button type="button" key={f} class={filtro === f ? 'ativa' : ''} onClick={() => setFiltro(f)}>{f === 'aberto' ? 'Abertos' : f === 'resolvido' ? 'Resolvidos' : 'Todos'}</button>)}
          </div>
          <select value={tipo} onChange={(e) => setTipo((e.target as HTMLSelectElement).value)}>
            <option value="">Todos os tipos</option>
            {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input type="search" placeholder="Buscar texto, carta, nome ou número" value={busca} onInput={(e) => setBusca((e.target as HTMLInputElement).value)} />
        </div>
        {erro && <p class="dev-erro">{erro}</p>}
        {!dados ? <p class="dev-suave">Carregando…</p> : !lista.length ? <p class="dev-vazio">{filtro === 'aberto' ? 'Nenhum relato aberto. 🎉' : 'Nada por aqui.'}</p> : (
          <ul>
            {lista.map((r) => (
              <li key={r.id}>
                <button type="button" class={`dev-item ${escolhido === r.id ? 'ativa' : ''}`} onClick={() => irPara('relatos', r.id)}>
                  {r.imagens[0] ? <img src={urlArquivo(r.id, r.imagens[0])} alt="" loading="lazy" /> : <span class="dev-sem-img">sem imagem</span>}
                  <span class="dev-item-texto">
                    <span class="dev-item-topo"><strong>#{r.numero}</strong><span class={`dev-tag tipo-${r.tipo}`}>{TIPOS[r.tipo] ?? r.tipo}</span>{r.estado === 'resolvido' && <span class="dev-tag bom">resolvido</span>}</span>
                    <span class="dev-item-oque">{r.oque}</span>
                    <span class="dev-suave">{r.nome || 'sem nome'} · {haQuanto(r.em)}{r.partida ? ' · com partida' : ''}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <section class="dev-detalhe">
        {escolhido ? <RelatoDetalhe key={escolhido} id={escolhido} aoMudar={recarregar} /> : <p class="dev-vazio">Escolha um relato na lista.</p>}
      </section>
    </div>
  );
}

function textoParaClaude(d: RelatoCompleto): string {
  const r = d.relato;
  const c = r.contexto;
  const v = c.vista;
  const linhas = [
    `Relato de erro #${d.numero} (${r.id}) — ${TIPOS[r.tipo] ?? r.tipo}, acontece ${REPETE[r.repete] ?? r.repete}, de ${r.nome || 'alguém sem nome'} em ${dataHora(r.em)}.`,
    `Versão do servidor no relato: ${r.servidor.versao ?? '?'}`,
    '',
    `O que aconteceu: ${r.oque}`,
    r.esperado ? `O que esperava: ${r.esperado}` : '',
    r.passos ? `O que fez antes: ${r.passos}` : '',
    r.cartas.length ? `Cartas: ${r.cartas.join(', ')}` : '',
    v ? `Mesa: rodada ${v.turn?.round}, turno ${v.turn?.number}, ${v.turn?.stepName}${v.stack?.length ? `; pilha: ${v.stack.map((s: { name: string }) => s.name).join(' | ')}` : ''}` : '',
    '',
    `Investigue a partir de jogo/: node ferramentas/relatos.ts ver ${d.numero}${r.partida ? ` e node ferramentas/relatos.ts reproduzir ${d.numero}` : ''}.`,
    `As imagens estão em jogo/dados-locais/relatos/${r.id}/. Ache a causa, corrija com teste e, no fim, marque como resolvido com node ferramentas/relatos.ts resolver ${d.numero} "<o que foi feito>".`,
  ];
  return linhas.filter((l, i, a) => l || (i > 0 && a[i - 1])).join('\n');
}

function RelatoDetalhe({ id, aoMudar }: { id: string; aoMudar: () => void }) {
  const { dados: d, erro, recarregar } = usePedido<RelatoCompleto>(`relatos/${id}`);
  const [ampliada, setAmpliada] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [rodando, setRodando] = useState(false);
  // enquanto a reprodução roda, pergunta de novo a cada 1,5 s
  useEffect(() => {
    if (!d?.reproducao?.rodando && !rodando) return;
    const t = setInterval(recarregar, 1500);
    return () => clearInterval(t);
  }, [d?.reproducao?.rodando, rodando]);
  useEffect(() => { if (d?.reproducao && !d.reproducao.rodando) setRodando(false); }, [d?.reproducao?.rodando]);
  if (erro) return <p class="dev-erro">{erro}</p>;
  if (!d) return <p class="dev-suave">Carregando…</p>;
  const r = d.relato;
  const c = r.contexto;
  const v = c.vista;
  const diag = c.diagnostico as { erros: { em: string; tipo: string; texto: string }[]; enviadas: { em: string; texto: string }[]; doServidor: { em: string; texto: string }[]; abertaHaSegundos: number } | undefined;
  const marcar = async (estado: 'aberto' | 'resolvido') => { await pedir(`relatos/${id}/estado`, { estado, nota }); setNota(''); recarregar(); aoMudar(); };
  const reproduzir = async () => { setRodando(true); await pedir(`relatos/${id}/reproduzir`, {}); recarregar(); };
  const versaoMudou = d.versaoAgora && r.servidor.versao && d.versaoAgora.split(' ')[0] !== r.servidor.versao.split(' ')[0];
  return (
    <div class="dev-pilha">
      <div class="dev-cabeca">
        <div>
          <h2>#{d.numero} <span class={`dev-tag tipo-${r.tipo}`}>{TIPOS[r.tipo] ?? r.tipo}</span> <span class={`dev-tag ${r.estado === 'resolvido' ? 'bom' : 'atencao'}`}>{r.estado}</span></h2>
          <p class="dev-suave">{r.nome || 'sem nome'} · {dataHora(r.em)} ({haQuanto(r.em)}) · acontece {REPETE[r.repete] ?? r.repete} · <code>{r.id}</code></p>
        </div>
        <div class="dev-acoes">
          <BotaoCopiar rotulo="Copiar para o Claude" texto={() => textoParaClaude(d)} />
          {r.partida && <button type="button" class="dev-btn" onClick={reproduzir} disabled={rodando || d.reproducao?.rodando}>{rodando || d.reproducao?.rodando ? 'Refazendo…' : 'Refazer a partida'}</button>}
          {r.partida && <a class="dev-btn" href={urlArquivo(id, 'partida.json')}>Baixar partida</a>}
          <button type="button" class="dev-btn dev-voltar-lista" onClick={() => irPara('relatos')}>Voltar</button>
        </div>
      </div>

      {r.estado === 'resolvido' && r.resolucao && <p class="dev-aviso bom">Resolvido em {dataHora(r.resolucao.em)}{r.resolucao.nota ? `: ${r.resolucao.nota}` : ''}</p>}
      {versaoMudou && <p class="dev-aviso">O código mudou desde o relato: era <code>{r.servidor.versao}</code>, agora roda <code>{d.versaoAgora}</code>.</p>}

      <section class="dev-bloco">
        <h3>O que aconteceu</h3>
        <p class="dev-texto">{r.oque}</p>
        {r.esperado && <><h3>O que esperava</h3><p class="dev-texto">{r.esperado}</p></>}
        {r.passos && <><h3>O que fez antes</h3><p class="dev-texto">{r.passos}</p></>}
        {r.cartas.length > 0 && <><h3>Cartas</h3><p>{r.cartas.map((n) => <span key={n} class="dev-tag">{n}</span>)}</p></>}
      </section>

      {r.imagens.length > 0 && (
        <section class="dev-bloco">
          <h3>Imagens ({r.imagens.length})</h3>
          <div class="dev-galeria">
            {r.imagens.map((im) => (
              <button type="button" key={im.arquivo} onClick={() => setAmpliada(im.arquivo)}>
                <img src={urlArquivo(id, im.arquivo)} alt={im.nome ?? im.origem} loading="lazy" />
                <span>{im.origem === 'tela' ? 'print da tela' : im.origem === 'aba' ? 'print da aba' : im.nome ?? 'anexo'}{im.marcada ? ' · marcada' : ''}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {(d.reproducao || rodando) && (
        <section class="dev-bloco">
          <h3>Partida refeita com o motor de agora {d.reproducao && !d.reproducao.rodando && <span class={`dev-tag ${d.reproducao.codigo === 0 && !/FALHA/.test(d.reproducao.saida) ? 'bom' : 'ruim'}`}>{d.reproducao.codigo === 0 && !/FALHA/.test(d.reproducao.saida) ? 'terminou' : 'falhou'}</span>}</h3>
          <pre class="dev-saida">{d.reproducao?.saida || 'Começando…'}</pre>
        </section>
      )}

      <section class="dev-bloco">
        <h3>Onde</h3>
        <dl class="dev-ficha">
          <dt>Tela</dt><dd>{c.tela ?? '?'} · {c.conectado ? 'conectado' : 'desconectado'} · {c.janela?.largura}×{c.janela?.altura} (densidade {c.janela?.densidade}) · {c.toque ? 'toque' : 'mouse'}</dd>
          <dt>Navegador</dt><dd class="dev-quebra">{c.navegador ?? '?'}</dd>
          {c.sala && <><dt>Sala</dt><dd>{c.sala.codigo} ({c.sala.estado}) · assento {c.voce} · {c.sala.assentos?.map((a: { nome: string | null; tipo: string }) => `${a.nome ?? '-'}${a.tipo === 'bot' ? ' (bot)' : ''}`).join(', ')}</dd></>}
          <dt>Partida junto</dt><dd>{r.partida ? 'sim' : `não${r.partidaAusente ? ` — ${r.partidaAusente}` : ''}`}</dd>
          {c.erroNaTela && <><dt>Aviso na tela</dt><dd class="dev-txt-ruim">{c.erroNaTela}</dd></>}
        </dl>
      </section>

      {v && (
        <section class="dev-bloco">
          <h3>A mesa quando abriu o relato</h3>
          <p>Rodada {v.turn?.round} (turno {v.turn?.number}), vez de <strong>{v.players?.[v.turn?.active]?.name}</strong>, {v.turn?.stepName}; prioridade: {v.priority === null ? '-' : v.players?.[v.priority]?.name}</p>
          <table class="dev-tabela">
            <thead><tr><th>Jogador</th><th>Vida</th><th>Mão</th><th>Grimório</th><th /></tr></thead>
            <tbody>{(v.players ?? []).map((p: { name: string; life: number; handCount: number; libraryCount: number; lost?: boolean; left?: boolean }, i: number) => <tr key={i}><td>{p.name}{i === c.voce ? ' (quem relatou)' : ''}</td><td>{p.life}</td><td>{p.handCount}</td><td>{p.libraryCount}</td><td>{p.lost ? 'perdeu' : p.left ? 'saiu' : ''}</td></tr>)}</tbody>
          </table>
          {v.stack?.length > 0 && <p><strong>Pilha:</strong> {v.stack.map((s: { name: string; targets: string[] }) => `${s.name}${s.targets?.length ? ` → ${s.targets.join(', ')}` : ''}`).join(' | ')}</p>}
          {v.decision && <p><strong>Decisão pendente:</strong> {v.decision.kind}{v.decision.prompt ? ` — ${v.decision.prompt}` : ''}</p>}
          {v.waiting && <p><strong>Esperando:</strong> {v.players?.[v.waiting.player]?.name} ({v.waiting.kind})</p>}
          <details><summary>Registro (últimas 25 linhas)</summary>
            <ol class="dev-registro">{(v.log ?? []).slice(-25).map((l: { round?: number; turn?: number; text: string }, i: number) => <li key={i}><span class="dev-suave">[{l.round ?? l.turn}]</span> {l.text}</li>)}</ol>
          </details>
        </section>
      )}

      {diag && (
        <section class="dev-bloco">
          <h3>Diagnóstico da página <span class="dev-suave">(aberta há {Math.round(diag.abertaHaSegundos / 60)} min)</span></h3>
          <Ocorrencias titulo={`Erros da página (${diag.erros.length})`} itens={diag.erros.map((o) => ({ em: o.em, texto: `${o.tipo}: ${o.texto}` }))} ruim aberto={diag.erros.length > 0} />
          <Ocorrencias titulo={`Avisos do servidor para a pessoa (${diag.doServidor.length})`} itens={diag.doServidor} aberto={diag.doServidor.length > 0} />
          <Ocorrencias titulo={`Últimas ações mandadas (${diag.enviadas.length})`} itens={diag.enviadas.slice(-20)} />
        </section>
      )}

      <section class="dev-bloco">
        <h3>Servidor na hora</h3>
        <p class="dev-suave">Versão <code>{r.servidor.versao ?? '?'}</code> · {r.servidor.memoriaMB} MB · {r.servidor.salas} salas · Node {r.servidor.node}</p>
        <Ocorrencias titulo={`Erros e avisos na hora antes do relato (${r.servidor.diario?.length ?? 0})`} itens={(r.servidor.diario ?? []).map((l) => ({ em: new Date(l.em).toISOString(), texto: `${l.nivel}: ${l.texto}` }))} ruim aberto={!!r.servidor.diario?.length} />
      </section>

      <section class="dev-bloco">
        <h3>Arquivos da pasta</h3>
        <ul class="dev-arquivos">{d.arquivos.map((a) => <li key={a.nome}><a href={urlArquivo(id, a.nome)} target="_blank" rel="noreferrer">{a.nome}</a> <span class="dev-suave">{a.bytes > 1048576 ? `${(a.bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(a.bytes / 1024))} KB`}</span></li>)}</ul>
      </section>

      <section class="dev-bloco">
        <h3>{r.estado === 'aberto' ? 'Marcar como resolvido' : 'Reabrir'}</h3>
        {r.estado === 'aberto' && <textarea rows={2} placeholder="O que foi feito (commit, carta corrigida…)" value={nota} onInput={(e) => setNota((e.target as HTMLTextAreaElement).value)} />}
        <div class="dev-acoes">
          {r.estado === 'aberto'
            ? <button type="button" class="dev-btn dev-primario" onClick={() => marcar('resolvido')}>Marcar como resolvido</button>
            : <button type="button" class="dev-btn" onClick={() => marcar('aberto')}>Reabrir</button>}
        </div>
      </section>

      {ampliada && (
        <div class="dev-lupa" onClick={() => setAmpliada(null)} role="dialog">
          <img src={urlArquivo(id, ampliada)} alt="" />
          <span class="dev-suave">clique para fechar · <a href={urlArquivo(id, ampliada)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>abrir em outra aba</a></span>
        </div>
      )}
    </div>
  );
}

function Ocorrencias({ titulo, itens, ruim, aberto }: { titulo: string; itens: { em: string; texto: string }[]; ruim?: boolean; aberto?: boolean }) {
  return (
    <details open={aberto}>
      <summary class={ruim && itens.length ? 'dev-txt-ruim' : ''}>{titulo}</summary>
      {itens.length ? <ul class="dev-ocorrencias">{itens.map((o, i) => <li key={i}><span class="dev-suave">{hora(o.em)}</span> <pre>{o.texto}</pre></li>)}</ul> : <p class="dev-suave">nada</p>}
    </details>
  );
}

// ---------------------------------------------------------------------------
function ErrosNavegador() {
  const { dados, erro, recarregar } = usePedido<ErroCliente[]>('erros', 30_000);
  const [ver, setVer] = useState<'abertos' | 'todos'>('abertos');
  const [aberto, setAberto] = useState<string | null>(null);
  const lista = (dados ?? []).filter((e) => ver === 'todos' || !e.resolvido);
  const acao = async (a: string, corpo: unknown) => { await pedir(`erros/${a}`, corpo); recarregar(); };
  return (
    <div class="dev-pilha">
      <div class="dev-cabeca">
        <div>
          <h2>Erros do navegador</h2>
          <p class="dev-suave">Exceções e promessas rejeitadas na página de qualquer jogador, mandadas sozinhas e agrupadas por assinatura. Um resolvido que volta a acontecer reabre.</p>
        </div>
        <div class="dev-segmentos">
          <button type="button" class={ver === 'abertos' ? 'ativa' : ''} onClick={() => setVer('abertos')}>Abertos</button>
          <button type="button" class={ver === 'todos' ? 'ativa' : ''} onClick={() => setVer('todos')}>Todos</button>
        </div>
      </div>
      {erro && <p class="dev-erro">{erro}</p>}
      {!dados ? <p class="dev-suave">Carregando…</p> : !lista.length ? <p class="dev-vazio">Nenhum erro {ver === 'abertos' ? 'aberto' : 'registrado'}. 🎉</p> : (
        <ul class="dev-erros">
          {lista.map((e) => (
            <li key={e.assinatura} class={e.resolvido ? 'resolvido' : ''}>
              <button type="button" class="dev-erro-linha" onClick={() => setAberto(aberto === e.assinatura ? null : e.assinatura)}>
                <span class="dev-erro-vezes"><strong>{e.vezes}×</strong><span class="dev-suave">{e.vezes24h} em 24 h</span></span>
                <span class="dev-erro-texto"><code>{e.texto.split('\n')[0]}</code><span class="dev-suave">{e.tipo === 'promessa' ? 'promessa rejeitada' : 'exceção'} · tela {e.tela || '?'} · {e.pessoas} navegador(es) · última {haQuanto(e.ultimo)} · primeira {dataHora(e.primeiro)}</span></span>
                {e.resolvido && <span class="dev-tag bom">resolvido</span>}
              </button>
              {aberto === e.assinatura && (
                <div class="dev-erro-corpo">
                  <pre class="dev-saida">{e.texto}{'\n\n'}{e.pilha || '(sem pilha)'}</pre>
                  <p class="dev-suave dev-quebra">Último navegador: {e.navegador} · versão do servidor: <code>{e.versao || '?'}</code> · assinatura <code>{e.assinatura}</code></p>
                  <div class="dev-acoes">
                    <BotaoCopiar rotulo="Copiar para o Claude" texto={() => `Erro automático do navegador no Magic Commander (${e.vezes} vezes, ${e.pessoas} navegador(es), última ${dataHora(e.ultimo)}, tela ${e.tela}, servidor ${e.versao}).\n\n${e.texto}\n\n${e.pilha}\n\nO cliente compilado é minificado: ache no código-fonte (jogo/cliente/src) de onde isso vem, corrija com teste e me diga a causa.`} />
                    {e.resolvido
                      ? <button type="button" class="dev-btn" onClick={() => acao(e.assinatura, { resolvido: false })}>Reabrir</button>
                      : <button type="button" class="dev-btn dev-primario" onClick={() => acao(e.assinatura, { resolvido: true })}>Marcar como resolvido</button>}
                    <button type="button" class="dev-btn dev-perigo" onClick={() => { if (confirm('Apagar este erro do histórico?')) void acao(e.assinatura, { apagar: true }); }}>Apagar</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function Servidor() {
  const { dados, erro } = usePedido<LinhaDiario[]>('diario', 5000);
  const [nivel, setNivel] = useState<'' | 'erro' | 'aviso' | 'info'>('');
  const [busca, setBusca] = useState('');
  const lista = (dados ?? []).filter((l) => (!nivel || l.nivel === nivel) && (!busca || l.texto.toLowerCase().includes(busca.toLowerCase()))).reverse();
  return (
    <div class="dev-pilha">
      <div class="dev-cabeca">
        <div>
          <h2>Diário do servidor</h2>
          <p class="dev-suave">O que o servidor escreveu desde que subiu (as últimas linhas ficam na memória; atualiza a cada 5 s).</p>
        </div>
        <div class="dev-filtros">
          <div class="dev-segmentos">
            {([['', 'Tudo'], ['erro', 'Erros'], ['aviso', 'Avisos'], ['info', 'Mensagens']] as const).map(([k, n]) => <button type="button" key={k} class={nivel === k ? 'ativa' : ''} onClick={() => setNivel(k)}>{n}</button>)}
          </div>
          <input type="search" placeholder="Filtrar" value={busca} onInput={(e) => setBusca((e.target as HTMLInputElement).value)} />
        </div>
      </div>
      {erro && <p class="dev-erro">{erro}</p>}
      {!dados ? <p class="dev-suave">Carregando…</p> : !lista.length ? <p class="dev-vazio">Nada por aqui.</p> : (
        <ol class="dev-diario">
          {lista.map((l, i) => <li key={`${l.em}-${i}`} class={`nivel-${l.nivel}`}><span class="dev-suave">{hora(l.em)}</span><span class="dev-tag">{l.nivel}</span><pre>{l.texto}</pre></li>)}
        </ol>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function Salas() {
  const { dados, erro } = usePedido<SalaDev[]>('salas', 5000);
  const [ver, setVer] = useState<'ativas' | 'todas'>('ativas');
  const lista = (dados ?? []).filter((s) => ver === 'todas' || s.conexoes > 0 || s.estado === 'jogando' || s.erro)
    .sort((a, b) => b.conexoes - a.conexoes || (b.partida?.iniciadaEm ?? 0) - (a.partida?.iniciadaEm ?? 0));
  return (
    <div class="dev-pilha">
      <div class="dev-cabeca">
        <div>
          <h2>Salas</h2>
          <p class="dev-suave">Só o que está à vista de todos na mesa (nada de mão nem grimório). Atualiza a cada 5 s.</p>
        </div>
        <div class="dev-segmentos">
          <button type="button" class={ver === 'ativas' ? 'ativa' : ''} onClick={() => setVer('ativas')}>Com gente ou jogando</button>
          <button type="button" class={ver === 'todas' ? 'ativa' : ''} onClick={() => setVer('todas')}>Todas ({dados?.length ?? 0})</button>
        </div>
      </div>
      {erro && <p class="dev-erro">{erro}</p>}
      {!dados ? <p class="dev-suave">Carregando…</p> : !lista.length ? <p class="dev-vazio">Nenhuma sala {ver === 'ativas' ? 'com gente agora' : 'guardada'}.</p> : (
        <div class="dev-salas">
          {lista.map((s) => (
            <article key={s.codigo} class={`dev-sala ${s.erro ? 'com-erro' : ''}`}>
              <header>
                <strong>{s.codigo}</strong>
                <span class="dev-tag">{s.estado}</span>
                <span class="dev-tag">{s.formato}</span>
                <span class="dev-suave">{s.conexoes} conexão(ões)</span>
              </header>
              {s.partida && (
                <p class="dev-suave">
                  {s.partida.rodada !== null ? `Rodada ${s.partida.rodada} · turno ${s.partida.turno} · ` : ''}
                  {s.partida.entradas ?? '?'} jogadas
                  {s.partida.iniciadaEm ? ` · começou ${haQuanto(s.partida.iniciadaEm)}` : ''}
                  {s.partida.encerradaEm ? ` · acabou ${haQuanto(s.partida.encerradaEm)}` : ''}
                </p>
              )}
              <ul>
                {s.assentos.map((a, i) => (
                  <li key={i}>
                    <span class={`dev-ponto ${a.conectado ? 'ligado' : ''}`} />
                    {a.nome ?? <span class="dev-suave">livre</span>}
                    {a.tipo === 'bot' && <span class="dev-tag">bot {a.nivel}</span>}
                    {i === s.anfitriao && <span class="dev-tag">anfitrião</span>}
                    {s.partida?.vidas?.[i] && <span class={s.partida.vidas[i].perdeu ? 'dev-suave' : ''}> · {s.partida.vidas[i].perdeu ? 'perdeu' : `${s.partida.vidas[i].vida} vida`}</span>}
                    {a.deck && <span class="dev-suave"> · {a.deck}</span>}
                  </li>
                ))}
              </ul>
              {s.erro && <pre class="dev-saida dev-txt-ruim">{s.erro}{s.falhas ? `\n(${s.falhas} falha(s) seguidas)` : ''}</pre>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function Cartas() {
  const { dados, erro } = usePedido<DecksDev>('decks');
  const [todas, setTodas] = useState(false);
  if (erro) return <p class="dev-erro">{erro}</p>;
  if (!dados) return <p class="dev-suave">Carregando…</p>;
  const esperando = dados.decks.filter((d) => !d.jogavel || d.faltamPreparacao.length);
  return (
    <div class="dev-pilha">
      <section>
        <div class="dev-cabeca">
          <div>
            <h2>Cartas que faltam implementar ({dados.cartasFaltando.length})</h2>
            <p class="dev-suave">As mais pedidas primeiro: cada uma destrava os decks ao lado.</p>
          </div>
          {dados.cartasFaltando.length > 0 && <BotaoCopiar rotulo="Copiar lista para o Claude" texto={() => `Implemente as regras destas cartas no motor do Magic Commander (jogo/cartas/), com testes, na ordem (as primeiras destravam mais decks):\n${dados.cartasFaltando.map((c) => `- ${c.nome} (${c.decks.join(', ')})`).join('\n')}`} />}
        </div>
        {!dados.cartasFaltando.length ? <p class="dev-vazio">Todas as cartas de todos os decks têm regra. 🎉</p> : (
          <table class="dev-tabela">
            <thead><tr><th>Carta</th><th>Decks que esperam</th></tr></thead>
            <tbody>{(todas ? dados.cartasFaltando : dados.cartasFaltando.slice(0, 30)).map((c) => <tr key={c.nome}><td>{c.nome}</td><td>{c.decks.join(', ')}</td></tr>)}</tbody>
          </table>
        )}
        {dados.cartasFaltando.length > 30 && <div class="dev-acoes"><button type="button" class="dev-btn" onClick={() => setTodas(!todas)}>{todas ? 'Mostrar só as 30 primeiras' : `Mostrar todas (${dados.cartasFaltando.length})`}</button></div>}
      </section>
      <section>
        <h2>Decks ({dados.decks.filter((d) => d.jogavel).length} jogáveis de {dados.decks.length})</h2>
        {esperando.length > 0 && (
          <ul class="dev-decks-esperando">
            {esperando.map((d) => (
              <li key={d.id}>
                <strong>{d.nome}</strong> {d.jogavel ? <span class="dev-tag bom">jogável</span> : <span class="dev-tag atencao">fora do saguão</span>}
                {d.faltamAtual.length > 0 && <span class="dev-suave"> · lista atual espera {d.faltamAtual.length} carta(s)</span>}
                {d.faltamPreparacao.length > 0 && <span class="dev-suave"> · versão nova espera {d.faltamPreparacao.length} carta(s)</span>}
                <details><summary class="dev-suave">quais</summary><p class="dev-suave">{[...new Set([...d.faltamAtual, ...d.faltamPreparacao])].join(', ')}</p></details>
              </li>
            ))}
          </ul>
        )}
        <details><summary>Todos os decks</summary>
          <table class="dev-tabela">
            <thead><tr><th>Deck</th><th>Comandante</th><th>Formato</th><th>Estado</th></tr></thead>
            <tbody>{dados.decks.map((d) => <tr key={d.id}><td>{d.nome}</td><td>{d.comandante ?? '-'}</td><td>{d.formato}</td><td>{d.jogavel ? 'jogável' : 'esperando cartas'}{d.temPreparacao ? ' · versão nova em preparação' : ''}</td></tr>)}</tbody>
          </table>
        </details>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
function Acesso() {
  const { dados, erro, recarregar } = usePedido<AcessoDev>('acesso');
  const encerrar = async (id: string | null) => { await pedir('acesso', { encerrar: id }); recarregar(); };
  if (erro) return <p class="dev-erro">{erro}</p>;
  if (!dados) return <p class="dev-suave">Carregando…</p>;
  return (
    <div class="dev-pilha">
      <section>
        <h2>Quem pode entrar</h2>
        <p>{dados.remoto
          ? <>A área está <strong>liberada pela internet</strong> (DEV_REMOTO=1): qualquer endereço com a chave entra.</>
          : <>A área só abre <strong>no computador que roda o servidor</strong> (http://localhost). Pelo túnel, de outro computador ou celular, ela responde como se não existisse.</>}</p>
        <p class="dev-suave">A chave fica em <code>jogo/dados-locais/senha-dev.txt</code> (ou na variável SENHA_DEV). Para trocar, apague o arquivo e reinicie o servidor: ele sorteia outra e todas as sessões caem. Cada sessão dura 12 h.</p>
      </section>
      <section>
        <div class="dev-cabeca">
          <h2>Sessões abertas ({dados.sessoes.length})</h2>
          {dados.sessoes.length > 1 && <button type="button" class="dev-btn dev-perigo" onClick={() => encerrar(null)}>Encerrar as outras</button>}
        </div>
        <table class="dev-tabela">
          <thead><tr><th>Entrou</th><th>Vale até</th><th>Endereço</th><th>Navegador</th><th /></tr></thead>
          <tbody>{dados.sessoes.map((s) => <tr key={s.id}><td>{dataHora(s.criada)}</td><td>{dataHora(s.expira)}</td><td>{s.ip}</td><td class="dev-quebra">{s.agente}</td><td>{s.esta ? <span class="dev-tag bom">esta</span> : <button type="button" class="dev-btn" onClick={() => encerrar(s.id)}>Encerrar</button>}</td></tr>)}</tbody>
        </table>
      </section>
      <section>
        <h2>Registro de acessos</h2>
        <p class="dev-suave">Cada entrada, saída, chave errada e bloqueio (dados-locais/dev-acessos.log).</p>
        <ol class="dev-diario">{dados.acessos.map((l, i) => <li key={i} class={/CHAVE-ERRADA|BLOQUEADO|RECUSADO/.test(l) ? 'nivel-erro' : ''}><pre>{l}</pre></li>)}</ol>
      </section>
    </div>
  );
}
