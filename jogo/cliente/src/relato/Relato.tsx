// Janela "Reportar erro". Ao abrir, tira um print da tela como estava (antes da janela aparecer) e guarda o estado da
// mesa naquele momento. A pessoa conta o que aconteceu; pode tirar outros prints (a janela some por 3 segundos para
// ela arrumar a tela), capturar a aba pelo navegador, anexar, colar ou arrastar imagens, marcar em cima delas e
// apontar as cartas envolvidas. Vão junto, sem ela precisar fazer nada: a partida inteira (o servidor junta pelo
// token do assento, para refazer o erro), a tela da mesa como ela via, navegador e tamanho da tela, os erros da página,
// as últimas ações e os erros do servidor. O texto fica guardado como rascunho até o envio dar certo.

import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ImagemRelato, PedidoRelato, RepeteRelato, RespostaRelato, TipoRelato } from '../../../servidor/protocolo.ts';
import { nomeCarta, todasAsCartas } from '../cartas.ts';
import { Janela } from '../Janela.tsx';
import { loja, salaGuardada, useLoja } from '../loja.ts';
import { preferencias } from '../preferencias.ts';
import { bytesDe, FORA_DO_PRINT, imagemDeArquivo, podeCapturarAba, printDaAba, printDaPagina } from './captura.ts';
import { diagnostico } from './diagnostico.ts';
import { Marcador } from './Marcador.tsx';
import { fecharRelato, useRelato } from './relatoLoja.ts';

const MAX_IMAGENS = 8;
const RASCUNHO = 'commander-da-mesa:relato-rascunho';
const NOME_GUARDADO = 'commander-da-mesa:nome';

const TIPOS: { id: TipoRelato; nome: string; dica: string }[] = [
  { id: 'regra', nome: 'Carta ou regra errada', dica: 'Uma carta fez o que não devia, ou deixou de fazer' },
  { id: 'travou', nome: 'Travou ou deu erro', dica: 'A partida parou, apareceu um aviso de erro, um botão não responde' },
  { id: 'visual', nome: 'Tela ou visual', dica: 'Algo fora do lugar, cortado, sobreposto ou difícil de ler' },
  { id: 'bot', nome: 'Bot estranho', dica: 'Um bot fez uma jogada sem sentido ou demorou demais' },
  { id: 'outro', nome: 'Outra coisa', dica: 'Qualquer outra coisa (ideias também valem)' },
];
const REPETE: { id: RepeteRelato; nome: string }[] = [
  { id: 'sempre', nome: 'Sempre' },
  { id: 'as-vezes', nome: 'Às vezes' },
  { id: 'uma-vez', nome: 'Só vi uma vez' },
  { id: 'nao-sei', nome: 'Não sei' },
];

interface Rascunho {
  tipo: TipoRelato | null;
  oque: string;
  esperado: string;
  passos: string;
  repete: RepeteRelato;
  cartas: string[];
  nome: string;
}
const vazio = (): Rascunho => ({ tipo: null, oque: '', esperado: '', passos: '', repete: 'nao-sei', cartas: [], nome: '' });

function lerRascunho(): Rascunho {
  try { return { ...vazio(), ...(JSON.parse(localStorage.getItem(RASCUNHO) ?? 'null') ?? {}) }; } catch { return vazio(); }
}
function guardarRascunho(r: Rascunho | null): void {
  try { if (r) localStorage.setItem(RASCUNHO, JSON.stringify(r)); else localStorage.removeItem(RASCUNHO); } catch { /* sem armazenamento */ }
}
function nomeGuardado(): string {
  try { return localStorage.getItem(NOME_GUARDADO) ?? ''; } catch { return ''; }
}

/** o que a página sabe agora: vai no relato como foi visto na hora em que a pessoa abriu */
function contextoAgora(): Record<string, unknown> {
  const e = loja.e;
  return {
    em: new Date().toISOString(),
    fuso: Intl.DateTimeFormat().resolvedOptions().timeZone,
    url: location.href,
    tela: e.fase,
    conectado: e.conectado,
    navegador: navigator.userAgent,
    idioma: navigator.language,
    janela: { largura: innerWidth, altura: innerHeight, densidade: devicePixelRatio, tela: `${screen.width}x${screen.height}` },
    toque: matchMedia('(pointer: coarse)').matches,
    // a versão do cliente: os nomes dos arquivos compilados mudam a cada versão
    cliente: [...document.scripts].map((s) => s.src.split('/').pop()).filter(Boolean),
    preferencias: preferencias(),
    sala: e.sala,
    voce: e.voce,
    vista: e.vista,
    respondida: e.respondida,
    paradas: e.paradas,
    avisos: e.avisos,
    erroNaTela: e.erro,
    recusaCombate: e.recusaCombate,
    pensando: e.pensando,
    decks: e.decks.length,
  };
}

/** cartas à vista na mesa agora (as primeiras sugestões do campo de cartas), da pilha primeiro */
function cartasDaMesa(): string[] {
  const v = loja.e.vista;
  if (!v) return [];
  const defs = [
    ...v.stack.map((s) => s.def),
    ...v.hand.map((o) => o.def),
    ...v.battlefield.map((o) => o.def),
    ...v.command.map((o) => o.def),
    ...v.players.flatMap((p) => p.graveyard.map((o) => o.def)),
    ...v.exile.map((o) => o.def),
  ];
  return [...new Set(defs.filter(Boolean))];
}

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tamanho = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

type Fase = 'capturando' | 'editando' | 'escondida' | 'enviando' | 'enviado';

export function Relato() {
  const pedido = useRelato();
  if (!pedido) return null;
  return <JanelaRelato key={pedido.vez} tipoInicial={pedido.tipo} textoInicial={pedido.texto} />;
}

function JanelaRelato({ tipoInicial, textoInicial }: { tipoInicial?: TipoRelato; textoInicial?: string }) {
  const e = useLoja();
  const [r, setR] = useState<Rascunho>(() => {
    const g = lerRascunho();
    const nome = g.nome || (e.sala && e.voce !== null ? e.sala.assentos[e.voce]?.nome ?? '' : '') || nomeGuardado();
    return { ...g, nome, tipo: tipoInicial ?? g.tipo, oque: textoInicial && !g.oque ? textoInicial : g.oque };
  });
  const [fase, setFase] = useState<Fase>('capturando');
  const [imagens, setImagens] = useState<ImagemRelato[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [marcando, setMarcando] = useState<number | null>(null);
  const [contagem, setContagem] = useState<number | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [busca, setBusca] = useState('');
  const [arrastando, setArrastando] = useState(false);
  // o estado da mesa na hora em que a pessoa abriu (escrever pode levar minutos e a partida seguir)
  const contexto = useRef<Record<string, unknown> | null>(null);
  const naSala = !!(e.sala && salaGuardada()?.codigo === e.sala.codigo);
  const emPartida = naSala && !!e.vista;
  const [anexarPartida, setAnexarPartida] = useState(true);
  const arquivo = useRef<HTMLInputElement>(null);
  const campoOque = useRef<HTMLTextAreaElement>(null);

  const mudar = (p: Partial<Rascunho>) => setR((x) => { const n = { ...x, ...p }; guardarRascunho(n); return n; });
  const adicionar = (im: ImagemRelato) => setImagens((l) => (l.length >= MAX_IMAGENS ? l : [...l, im]));
  const cheio = imagens.length >= MAX_IMAGENS;

  // ao abrir: o estado da mesa e o print da tela, antes de a janela aparecer
  useEffect(() => {
    contexto.current = contextoAgora();
    let vivo = true;
    printDaPagina()
      .then((dados) => { if (vivo) adicionar({ dados, origem: 'tela' }); })
      .catch((x) => { if (vivo) setAviso(`Não deu para tirar o print automático (${x instanceof Error ? x.message : x}). Use "Capturar a aba" ou anexe uma imagem.`); console.warn('relato: print', x); })
      .finally(() => { if (vivo) setFase('editando'); });
    return () => { vivo = false; };
  }, []);

  useEffect(() => { if (fase === 'editando' && !id) campoOque.current?.focus({ preventScroll: true }); }, [fase === 'editando']);

  // colar uma imagem (Ctrl+V) em qualquer lugar da janela
  useEffect(() => {
    if (fase !== 'editando') return;
    const colar = (ev: ClipboardEvent) => {
      const itens = [...(ev.clipboardData?.items ?? [])].filter((i) => i.type.startsWith('image/'));
      if (!itens.length) return;
      ev.preventDefault();
      for (const i of itens) { const f = i.getAsFile(); if (f) void anexar([f]); }
    };
    addEventListener('paste', colar);
    return () => removeEventListener('paste', colar);
  });

  async function anexar(arquivos: File[] | FileList): Promise<void> {
    for (const f of [...arquivos]) {
      if (!f.type.startsWith('image/')) { setAviso(`"${f.name}" não é uma imagem.`); continue; }
      try { adicionar({ dados: await imagemDeArquivo(f), origem: 'anexo', nome: f.name || undefined }); } catch (x) { setAviso(`Não deu para abrir "${f.name}": ${x instanceof Error ? x.message : x}`); }
    }
  }

  /** a janela some, conta 3 segundos (para a pessoa arrumar a tela, passar o mouse numa carta…) e tira o print */
  function novoPrint(): void {
    setAviso(null);
    setFase('escondida');
    let n = 3;
    setContagem(n);
    const passo = () => {
      n -= 1;
      if (n > 0) { setContagem(n); t = setTimeout(passo, 1000); return; }
      setContagem(0);
      // um quadro para o aviso da contagem sumir antes do print
      requestAnimationFrame(() => printDaPagina()
        .then((dados) => adicionar({ dados, origem: 'tela' }))
        .catch((x) => setAviso(`O print não saiu: ${x instanceof Error ? x.message : x}`))
        .finally(() => { setContagem(null); setFase('editando'); }));
    };
    let t = setTimeout(passo, 1000);
    cancelarContagem.current = () => { clearTimeout(t); setContagem(null); setFase('editando'); };
  }
  const cancelarContagem = useRef<() => void>(() => {});

  async function capturarAba(): Promise<void> {
    setAviso(null);
    setFase('escondida');
    try {
      const dados = await printDaAba(() => new Promise((ok) => setTimeout(ok, 350)));
      adicionar({ dados, origem: 'aba' });
    } catch (x) {
      const negou = x instanceof DOMException && x.name === 'NotAllowedError';
      setAviso(negou ? 'A captura da aba foi cancelada.' : `A captura da aba não funcionou: ${x instanceof Error ? x.message : x}`);
    } finally {
      setFase('editando');
    }
  }

  // ------------------------------------------------------------------ cartas envolvidas
  const todas = useMemo(() => todasAsCartas(), []);
  const daMesa = useMemo(() => cartasDaMesa(), []);
  const sugestoes = useMemo(() => {
    const q = normalizar(busca.trim());
    const ja = new Set(r.cartas);
    if (!q) return daMesa.filter((d) => !ja.has(d)).slice(0, 8);
    const bate = (c: { def: string; pt: string | null }) => normalizar(c.def).includes(q) || (!!c.pt && normalizar(c.pt).includes(q));
    // as da mesa primeiro, depois as do jogo todo
    const mesa = new Set(daMesa);
    const l = todas.filter((c) => !ja.has(c.def) && bate(c));
    l.sort((a, b) => Number(mesa.has(b.def)) - Number(mesa.has(a.def)) || Number(normalizar(b.pt ?? b.def).startsWith(q)) - Number(normalizar(a.pt ?? a.def).startsWith(q)));
    return l.slice(0, 8).map((c) => c.def);
  }, [busca, r.cartas, daMesa, todas]);
  const juntarCarta = (def: string) => { if (!r.cartas.includes(def) && r.cartas.length < 30) mudar({ cartas: [...r.cartas, def] }); setBusca(''); };

  // ------------------------------------------------------------------ envio
  const bytes = imagens.reduce((s, i) => s + bytesDe(i.dados), 0);
  const podeEnviar = r.oque.trim().length >= 3 && fase === 'editando';

  async function enviar(): Promise<void> {
    if (!podeEnviar) { if (r.oque.trim().length < 3) { setErro('Conte o que aconteceu (o primeiro campo).'); campoOque.current?.focus(); } return; }
    setErro(null);
    setFase('enviando');
    try { if (r.nome.trim()) localStorage.setItem(NOME_GUARDADO, r.nome.trim()); } catch { /* sem armazenamento */ }
    const corpo: PedidoRelato = {
      tipo: r.tipo ?? 'outro', oque: r.oque, esperado: r.esperado, passos: r.passos, repete: r.repete, cartas: r.cartas, nome: r.nome,
      imagens,
      sala: naSala ? salaGuardada() : null,
      anexarPartida: emPartida && anexarPartida,
      contexto: { ...(contexto.current ?? contextoAgora()), noEnvio: { em: new Date().toISOString(), tela: loja.e.fase, conectado: loja.e.conectado }, diagnostico: diagnostico() },
    };
    try {
      const resp = await fetch('/api/relatos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
      let dados: RespostaRelato | null = null;
      try { dados = await resp.json() as RespostaRelato; } catch { /* resposta sem JSON (proxy, servidor caído) */ }
      if (!resp.ok || !dados || !dados.ok) throw new Error(dados && !dados.ok ? dados.erro : resp.status === 401 ? 'A sessão expirou: entre de novo e reenvie (o texto fica guardado)' : `o servidor respondeu ${resp.status}`);
      guardarRascunho(null);
      setId(dados.id);
      setFase('enviado');
    } catch (x) {
      setErro(`Não foi enviado: ${x instanceof Error ? x.message : x}. O que você escreveu continua aqui; tente de novo.`);
      setFase('editando');
    }
  }

  const fechar = () => {
    if (fase === 'enviando') return;
    fecharRelato();
  };
  const descartar = () => { guardarRascunho(null); fecharRelato(); };
  const numero = id ? id.slice(-4).toUpperCase() : '';

  if (fase === 'capturando') return <div class={`relato-capturando ${FORA_DO_PRINT}`} role="status">Tirando o print da tela…</div>;

  if (fase === 'enviado') {
    return (
      <Janela titulo="Relato enviado" classe="relato relato-enviado" fechar={fechar}>
        <div class="relato-ok">
          <span class="relato-ok-marca" aria-hidden="true">✓</span>
          <p>Obrigado! O relato chegou com {imagens.length ? `${imagens.length} ${imagens.length === 1 ? 'imagem' : 'imagens'}` : 'as informações'}{corpo(emPartida && anexarPartida)}.</p>
          <p class="suave">Número do relato:</p>
          <strong class="relato-numero">{numero}</strong>
          <p class="suave">Se quiser comentar depois, cite esse número.</p>
        </div>
        <div class="botoes-linha relato-acoes">
          <button type="button" class="botao" onClick={() => { void navigator.clipboard?.writeText(numero).then(() => setCopiado(true)); }}>{copiado ? 'Copiado' : 'Copiar número'}</button>
          <button type="button" class="botao cheio" onClick={fechar}>Fechar</button>
        </div>
      </Janela>
    );
  }

  const tipoAtual = TIPOS.find((t) => t.id === r.tipo);
  const diag = diagnostico();

  return (
    <>
      {contagem !== null && contagem > 0 && (
        <div class={`relato-contagem ${FORA_DO_PRINT}`} role="status">
          <span>Print em <b>{contagem}</b>… arrume a tela</span>
          <button type="button" class="botao pequeno" onClick={() => cancelarContagem.current()}>Cancelar</button>
        </div>
      )}
      <Janela titulo="Reportar erro" larga classe="relato" fechar={fechar} escondida={fase === 'escondida' || marcando !== null}>
        <form class="relato-form" onSubmit={(ev) => { ev.preventDefault(); void enviar(); }}
          onKeyDown={(ev) => { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); void enviar(); } }}>
          <p class="suave relato-intro">Conte o que deu errado. O print da tela e o estado do jogo vão junto, para dar para ver exatamente o que aconteceu.</p>

          <fieldset class="relato-campo">
            <legend class="rot">Que tipo de problema?</legend>
            <div class="relato-chips">
              {TIPOS.map((t) => (
                <button key={t.id} type="button" class={`relato-chip ${r.tipo === t.id ? 'ativo' : ''}`} aria-pressed={r.tipo === t.id} title={t.dica} onClick={() => mudar({ tipo: r.tipo === t.id ? null : t.id })}>{t.nome}</button>
              ))}
            </div>
            {tipoAtual && <small class="suave">{tipoAtual.dica}</small>}
          </fieldset>

          <label class="relato-campo">
            <span class="rot">O que aconteceu? <em class="relato-obrigatorio">obrigatório</em></span>
            <textarea ref={campoOque} rows={4} maxLength={8000} value={r.oque} onInput={(ev) => mudar({ oque: ev.currentTarget.value })}
              placeholder="Ex.: conjurei Lightning Bolt no oponente e a vida dele não baixou; o aviso dizia “…”" />
          </label>

          <div class="relato-duas">
            <label class="relato-campo">
              <span class="rot">O que você esperava?</span>
              <textarea rows={3} maxLength={4000} value={r.esperado} onInput={(ev) => mudar({ esperado: ev.currentTarget.value })} placeholder="Ex.: que ele perdesse 3 de vida" />
            </label>
            <label class="relato-campo">
              <span class="rot">O que você fez logo antes?</span>
              <textarea rows={3} maxLength={4000} value={r.passos} onInput={(ev) => mudar({ passos: ev.currentTarget.value })} placeholder="Ex.: 1. passei a vez com a pilha vazia 2. o bot atacou 3. …" />
            </label>
          </div>

          <fieldset class="relato-campo">
            <legend class="rot">Acontece de novo?</legend>
            <div class="relato-chips">
              {REPETE.map((x) => <button key={x.id} type="button" class={`relato-chip ${r.repete === x.id ? 'ativo' : ''}`} aria-pressed={r.repete === x.id} onClick={() => mudar({ repete: x.id })}>{x.nome}</button>)}
            </div>
          </fieldset>

          <div class="relato-campo">
            <label class="rot" for="relato-cartas">Cartas envolvidas</label>
            {r.cartas.length > 0 && (
              <ul class="relato-cartas">
                {r.cartas.map((c) => (
                  <li key={c}><span>{nomeCarta(c, c)}</span><button type="button" aria-label={`Tirar ${nomeCarta(c, c)}`} title="Tirar" onClick={() => mudar({ cartas: r.cartas.filter((x) => x !== c) })}>×</button></li>
                ))}
              </ul>
            )}
            <input id="relato-cartas" type="search" autocomplete="off" value={busca} onInput={(ev) => setBusca(ev.currentTarget.value)}
              onKeyDown={(ev) => { if (ev.key === 'Enter' && !(ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); if (sugestoes[0]) juntarCarta(sugestoes[0]); } }}
              placeholder="Procure pelo nome, em português ou em inglês" />
            {sugestoes.length > 0 && (
              <div class="relato-sugestoes">
                {!busca && <small class="suave">Na mesa agora:</small>}
                {sugestoes.map((d) => <button key={d} type="button" class="relato-chip pequeno" onClick={() => juntarCarta(d)}>+ {nomeCarta(d, d)}</button>)}
              </div>
            )}
          </div>

          <div class={`relato-campo relato-imagens ${arrastando ? 'arrastando' : ''}`}
            onDragOver={(ev) => { if ([...(ev.dataTransfer?.types ?? [])].includes('Files')) { ev.preventDefault(); setArrastando(true); } }}
            onDragLeave={(ev) => { if (ev.currentTarget === ev.target) setArrastando(false); }}
            onDrop={(ev) => { ev.preventDefault(); setArrastando(false); if (ev.dataTransfer?.files.length) void anexar(ev.dataTransfer.files); }}>
            <span class="rot">Prints e imagens <span class="relato-conta">{imagens.length}/{MAX_IMAGENS}{imagens.length ? ` · ${tamanho(bytes)}` : ''}</span></span>
            {imagens.length > 0 && (
              <ul class="relato-galeria">
                {imagens.map((im, i) => (
                  <li key={i}>
                    <button type="button" class="relato-miniatura" title="Marcar em cima desta imagem" onClick={() => setMarcando(i)}><img src={im.dados} alt={`Imagem ${i + 1}`} /></button>
                    <span class="relato-legenda">{im.origem === 'tela' ? 'Print da tela' : im.origem === 'aba' ? 'Captura da aba' : im.nome ?? 'Imagem'}{im.marcada ? ' · marcada' : ''}</span>
                    <span class="botoes-linha">
                      <button type="button" class="botao pequeno" onClick={() => setMarcando(i)}>Marcar</button>
                      <button type="button" class="botao pequeno fantasma" onClick={() => setImagens((l) => l.filter((_, k) => k !== i))}>Tirar</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div class="botoes-linha">
              <button type="button" class="botao pequeno" disabled={cheio} onClick={novoPrint} title="A janela some por 3 segundos: arrume a tela (abra o que quiser mostrar, passe o mouse numa carta) e o print sai sozinho">Novo print da tela</button>
              {podeCapturarAba() && <button type="button" class="botao pequeno" disabled={cheio} onClick={() => void capturarAba()} title="O navegador pede permissão e captura a aba exatamente como aparece">Capturar a aba</button>}
              <button type="button" class="botao pequeno" disabled={cheio} onClick={() => arquivo.current?.click()}>Anexar imagem</button>
              <input ref={arquivo} type="file" accept="image/*" multiple hidden onChange={(ev) => { const f = ev.currentTarget.files; if (f?.length) void anexar(f); ev.currentTarget.value = ''; }} />
            </div>
            <small class="suave">Também dá para colar (Ctrl+V) ou arrastar uma imagem para cá. Clique numa imagem para marcar em cima dela.</small>
          </div>

          {aviso && <p class="relato-aviso" role="status">{aviso}</p>}

          <label class="relato-campo relato-nome">
            <span class="rot">Seu nome</span>
            <input type="text" maxLength={60} value={r.nome} onInput={(ev) => mudar({ nome: ev.currentTarget.value })} placeholder="Para saber com quem falar" />
          </label>

          {emPartida && (
            <label class="relato-check">
              <input type="checkbox" checked={anexarPartida} onChange={(ev) => setAnexarPartida(ev.currentTarget.checked)} />
              <span>Mandar a partida junto <small class="suave">(todas as jogadas desde o começo, para refazer o erro exatamente; só quem cuida do jogo vê)</small></span>
            </label>
          )}

          <details class="relato-detalhes">
            <summary>O que mais vai junto</summary>
            <ul>
              <li>A mesa como você via quando abriu esta janela{e.vista ? ` (rodada ${e.vista.turn.round || '–'}, ${e.vista.turn.stepName})` : ''}</li>
              <li>Navegador, tamanho da tela e as suas preferências do jogo</li>
              <li>Erros da página: {diag.erros.length}{diag.erros.length ? ` (o último: ${diag.erros[diag.erros.length - 1].texto.split('\n')[0].slice(0, 90)})` : ''}</li>
              <li>Suas últimas ações: {diag.enviadas.length} · avisos do servidor: {diag.doServidor.length}</li>
              <li>Os erros que o servidor registrou na última hora</li>
            </ul>
          </details>

          {erro && <p class="relato-erro" role="alert">{erro}</p>}

          <div class="botoes-linha relato-acoes">
            <button type="button" class="botao fantasma" onClick={descartar} disabled={fase === 'enviando'} title="Fecha e apaga o rascunho">Descartar</button>
            <span class="relato-espaco" />
            <button type="button" class="botao" onClick={fechar} disabled={fase === 'enviando'} title="Fecha e guarda o texto para depois">Fechar</button>
            <button type="submit" class="botao cheio" disabled={fase === 'enviando' || !r.oque.trim()} title="Enviar (Ctrl+Enter)">{fase === 'enviando' ? 'Enviando…' : 'Enviar relato'}</button>
          </div>
        </form>
      </Janela>
      {marcando !== null && imagens[marcando] && (
        <Marcador dados={imagens[marcando].dados} cancelar={() => setMarcando(null)}
          salvar={(dados) => { const i = marcando; setImagens((l) => l.map((im, k) => (k === i && dados !== im.dados ? { ...im, dados, marcada: true } : im))); setMarcando(null); }} />
      )}
    </>
  );
}

const corpo = (partida: boolean) => (partida ? ' e a partida inteira' : '');
