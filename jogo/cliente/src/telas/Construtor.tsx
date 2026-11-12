// Tela Montar deck: montar um deck de Commander com as cartas que o jogo já tem (todas com regras), escolhendo o
// comandante primeiro. À esquerda, as cartas disponíveis (busca em português e em inglês, tipo, cor e ordem); à
// direita, o deck: comandante, contagem até 100, terrenos básicos, cartas por tipo, curva de mana e o que falta
// acertar. O servidor confere as regras de deck de novo ao gravar (servidor/catalogo/montar.ts).
//
// O deck aberto por "Montar um deck" guarda o rascunho no navegador a cada mudança: sair sem gravar não perde o
// trabalho (editar um deck ou usar um como base não mexe no rascunho).

import { useEffect, useMemo, useState } from 'preact/hooks';
import type { CartaMontagem } from '../../../servidor/protocolo.ts';
import { info, urlImagem } from '../cartas.ts';
import { loja } from '../loja.ts';
import { notaBusca, textosDaCarta, type TextosBusca } from '../mesa/escolhas.ts';
import { Simbolos } from '../mesa/Simbolos.tsx';

export interface DeckInicial {
  /** null: deck novo */
  id: string | null;
  nome: string;
  comandante: string | null;
  parceiro: string | null;
  cartas: Record<string, number>;
}

const RASCUNHO = 'commander-da-mesa:rascunho-deck';
const VAZIO: DeckInicial = { id: null, nome: '', comandante: null, parceiro: null, cartas: {} };

export function rascunhoGuardado(): DeckInicial | null {
  try {
    const r = JSON.parse(localStorage.getItem(RASCUNHO) ?? 'null') as DeckInicial | null;
    return r && typeof r === 'object' && r.cartas ? { ...r, id: null } : null;
  } catch { return null; }
}
function guardarRascunho(d: DeckInicial | null): void {
  try {
    if (d) localStorage.setItem(RASCUNHO, JSON.stringify(d));
    else localStorage.removeItem(RASCUNHO);
  } catch { /* sem armazenamento */ }
}

const GRUPOS = [
  { id: 'Creature', nome: 'Criaturas' },
  { id: 'Planeswalker', nome: 'Planeswalkers' },
  { id: 'Battle', nome: 'Batalhas' },
  { id: 'Instant', nome: 'Mágicas instantâneas' },
  { id: 'Sorcery', nome: 'Feitiços' },
  { id: 'Artifact', nome: 'Artefatos' },
  { id: 'Enchantment', nome: 'Encantamentos' },
  { id: 'Land', nome: 'Terrenos' },
  { id: 'Outro', nome: 'Outras' },
] as const;
type Grupo = typeof GRUPOS[number]['id'];

/** o grupo da carta pela linha de tipo da frente (um terreno criatura conta como criatura) */
function grupoDe(nome: string): Grupo {
  const esq = (info(nome)?.tipo ?? '').split(' // ')[0].split(' — ')[0];
  const tem = (t: string) => new RegExp(`\\b${t}\\b`).test(esq);
  if (tem('Land') && !tem('Creature')) return 'Land';
  for (const g of GRUPOS) if (g.id !== 'Outro' && tem(g.id)) return g.id;
  return 'Outro';
}

const CORES = [
  { id: 'W', nome: 'Branco' }, { id: 'U', nome: 'Azul' }, { id: 'B', nome: 'Preto' },
  { id: 'R', nome: 'Vermelho' }, { id: 'G', nome: 'Verde' }, { id: 'C', nome: 'Incolor' },
] as const;
const BASICOS: Record<string, string> = { W: 'Plains', U: 'Island', B: 'Swamp', R: 'Mountain', G: 'Forest' };

const nomeDe = (n: string) => info(n)?.pt ?? n;
/** cópias que o deck pode ter (teto 0: sem limite) */
const maximo = (c: CartaMontagem | undefined) => (c?.teto === undefined ? 1 : c.teto === 0 ? Infinity : c.teto);
const POR_PAGINA = 96;

function Miniatura({ nome, tam = 'p' }: { nome: string; tam?: 'p' | 'm' }) {
  const url = urlImagem(nome, 0, tam);
  return url
    ? <img class="mt-img" src={url} alt={nomeDe(nome)} loading="lazy" draggable={false} />
    : <span class="mt-img sem-imagem">{nomeDe(nome)}</span>;
}

export function Construtor({ inicial, rascunho = false, sair }: { inicial: DeckInicial; rascunho?: boolean; sair: (gravou: boolean) => void }) {
  const [todas, setTodas] = useState<CartaMontagem[] | null>(null);
  const [nome, setNome] = useState(inicial.nome);
  const [comandante, setComandante] = useState<string | null>(inicial.comandante);
  const [parceiro, setParceiro] = useState<string | null>(inicial.parceiro);
  const [cartas, setCartas] = useState<Record<string, number>>(inicial.cartas);
  /** o que um clique numa carta da coleção faz: escolher o comandante, o parceiro ou pôr no deck */
  const [escolhendo, setEscolhendo] = useState<'comandante' | 'parceiro' | null>(inicial.comandante ? null : 'comandante');
  const [busca, setBusca] = useState('');
  const [grupo, setGrupo] = useState<Grupo | 'todos'>('todos');
  const [cores, setCores] = useState<string[]>([]);
  const [ordem, setOrdem] = useState<'nome' | 'custo'>('nome');
  const [pagina, setPagina] = useState(1);
  const [zoom, setZoom] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [falhas, setFalhas] = useState<{ erro: string; erros: string[] } | null>(null);
  const [mexeu, setMexeu] = useState(false);

  useEffect(() => { void loja.cartasParaMontar().then(setTodas); }, []);
  // o rascunho de um deck novo
  useEffect(() => {
    if (rascunho && mexeu) guardarRascunho({ id: null, nome, comandante, parceiro, cartas });
  }, [nome, comandante, parceiro, cartas, mexeu]);
  // uma busca ou um filtro novo volta para a primeira página
  useEffect(() => setPagina(1), [busca, grupo, cores, ordem, escolhendo]);

  const porNome = useMemo(() => new Map((todas ?? []).map((c) => [c.nome, c])), [todas]);
  /** os textos da busca de cada carta, montados uma vez */
  const textos = useMemo(() => {
    const m = new Map<string, TextosBusca>();
    for (const c of todas ?? []) m.set(c.nome, textosDaCarta([nomeDe(c.nome), c.nome], info(c.nome)));
    return m;
  }, [todas]);
  const grupos = useMemo(() => new Map((todas ?? []).map((c) => [c.nome, grupoDe(c.nome)])), [todas]);

  const cmd = comandante ? porNome.get(comandante) : undefined;
  const par = parceiro ? porNome.get(parceiro) : undefined;
  const identidade = new Set([...(cmd?.ci ?? []), ...(par?.ci ?? [])]);
  const cabe = (c: CartaMontagem) => c.ci.every((x) => identidade.has(x));

  const mudar = (f: () => void) => { f(); setMexeu(true); setFalhas(null); };
  const qtd = (n: string) => cartas[n] ?? 0;
  const por = (n: string, q: number) => mudar(() => setCartas((c) => {
    const novo = { ...c };
    if (q > 0) novo[n] = q; else delete novo[n];
    return novo;
  }));
  const somar = (n: string, d: number) => {
    const q = Math.max(0, Math.min(maximo(porNome.get(n)), qtd(n) + d));
    if (q !== qtd(n)) por(n, q);
  };

  const escolherComandante = (n: string) => mudar(() => {
    setComandante(n);
    // o parceiro de antes só fica se ainda formar dupla com o comandante novo
    if (parceiro && !porNome.get(n)?.parceiros?.includes(parceiro)) setParceiro(null);
    setCartas((c) => { const novo = { ...c }; delete novo[n]; return novo; });
    setEscolhendo(null);
  });
  const escolherParceiro = (n: string) => mudar(() => {
    setParceiro(n);
    setCartas((c) => { const novo = { ...c }; delete novo[n]; return novo; });
    setEscolhendo(null);
  });

  // ---------------------------------------------------------------- a coleção
  const lista = useMemo(() => {
    if (!todas) return [];
    let l: CartaMontagem[];
    if (escolhendo === 'comandante') l = todas.filter((c) => c.comandante);
    else if (escolhendo === 'parceiro') l = (cmd?.parceiros ?? []).map((n) => porNome.get(n)).filter((c): c is CartaMontagem => !!c);
    else l = todas.filter((c) => cabe(c) && c.nome !== comandante && c.nome !== parceiro);
    if (grupo !== 'todos') l = l.filter((c) => grupos.get(c.nome) === grupo);
    if (cores.length) l = l.filter((c) => (c.ci.length === 0 ? cores.includes('C') : c.ci.some((x) => cores.includes(x))));
    const notas = new Map<string, 0 | 1>();
    if (busca.trim()) {
      l = l.filter((c) => {
        const n = notaBusca(textos.get(c.nome)!, busca);
        if (n !== null) notas.set(c.nome, n);
        return n !== null;
      });
    }
    const porNomePt = (a: CartaMontagem, b: CartaMontagem) => nomeDe(a.nome).localeCompare(nomeDe(b.nome));
    return [...l].sort((a, b) => (notas.get(a.nome) ?? 0) - (notas.get(b.nome) ?? 0)
      || (ordem === 'custo' ? a.vm - b.vm : 0) || porNomePt(a, b));
  }, [todas, escolhendo, comandante, parceiro, grupo, cores.join(), busca, ordem]);

  const clicarNaColecao = (c: CartaMontagem) => {
    if (escolhendo === 'comandante') escolherComandante(c.nome);
    else if (escolhendo === 'parceiro') escolherParceiro(c.nome);
    else somar(c.nome, 1);
  };

  // ---------------------------------------------------------------- o deck
  const nomes = Object.keys(cartas);
  const total = (comandante ? 1 : 0) + (parceiro ? 1 : 0) + nomes.reduce((n, k) => n + cartas[k], 0);
  const fora = comandante ? nomes.filter((n) => { const c = porNome.get(n); return !c || !cabe(c); }) : [];
  const demais = nomes.filter((n) => cartas[n] > maximo(porNome.get(n)));
  const basicos = (identidade.size ? [...identidade].map((c) => BASICOS[c]) : ['Wastes']).filter((n) => n && porNome.has(n));
  const porGrupo = GRUPOS.map((g) => ({ ...g, cartas: nomes.filter((n) => (grupos.get(n) ?? grupoDe(n)) === g.id).sort((a, b) => (porNome.get(a)?.vm ?? 0) - (porNome.get(b)?.vm ?? 0) || nomeDe(a).localeCompare(nomeDe(b))) }))
    .filter((g) => g.cartas.length);
  // curva de mana: as mágicas (sem terrenos), por valor de mana até 7+
  const curva = Array.from({ length: 8 }, () => 0);
  for (const n of nomes) if (grupos.get(n) !== 'Land') curva[Math.min(7, porNome.get(n)?.vm ?? 0)] += cartas[n];
  const topoCurva = Math.max(1, ...curva);
  const terrenos = nomes.filter((n) => grupos.get(n) === 'Land').reduce((s, n) => s + cartas[n], 0);

  const problemas: string[] = [];
  if (!comandante) problemas.push('Escolha o comandante.');
  if (total < 100) problemas.push(100 - total === 1 ? 'Falta 1 carta para 100.' : `Faltam ${100 - total} cartas para 100.`);
  if (total > 100) problemas.push(`Sobram ${total - 100} ${total - 100 === 1 ? 'carta' : 'cartas'}: o deck tem exatamente 100.`);
  if (fora.length) problemas.push(`${fora.length === 1 ? '1 carta está' : `${fora.length} cartas estão`} fora da identidade de cor do comandante.`);
  if (demais.length) problemas.push(`Cópias demais de ${demais.map(nomeDe).join(', ')}.`);
  if (!nome.trim()) problemas.push('Dê um nome ao deck.');

  const salvar = async () => {
    if (!comandante) return;
    setSalvando(true);
    const r = await loja.salvarDeckCriado({ id: inicial.id, nome: nome.trim(), comandante, parceiro, cartas: nomes.map((n) => ({ nome: n, quantidade: cartas[n] })) });
    setSalvando(false);
    if ('id' in r) {
      if (rascunho) guardarRascunho(null);
      sair(true);
    } else setFalhas(r);
  };
  const voltar = () => {
    // o rascunho fica guardado; editar um deck ou usar um como base perde as mudanças
    if (mexeu && !rascunho && !confirm('Sair sem gravar as mudanças deste deck?')) return;
    sair(false);
  };
  const recomecar = () => {
    if (!confirm('Começar um deck do zero? O rascunho atual se perde.')) return;
    guardarRascunho(null);
    setNome(VAZIO.nome); setComandante(null); setParceiro(null); setCartas({}); setEscolhendo('comandante'); setMexeu(false); setFalhas(null);
  };

  const linhaDeck = (n: string) => {
    const c = porNome.get(n);
    const ruim = fora.includes(n) || demais.includes(n);
    return (
      <li key={n} class={`mt-linha ${ruim ? 'ruim' : ''}`} onMouseEnter={() => setZoom(n)} onMouseLeave={() => setZoom(null)}>
        <span class="mt-qtd">{cartas[n]}</span>
        <span class="mt-linha-nome" title={n}>{nomeDe(n)}{!c && <em> (sem regras)</em>}</span>
        {c?.custo && <Simbolos custo={c.custo.split(' // ')[0]} tam={14} />}
        <span class="mt-mais-menos">
          <button type="button" class="mt-mm" aria-label={`Tirar uma ${nomeDe(n)}`} onClick={() => somar(n, -1)}>−</button>
          <button type="button" class="mt-mm" aria-label={`Pôr mais uma ${nomeDe(n)}`} disabled={cartas[n] >= maximo(c)} onClick={() => somar(n, 1)}>+</button>
        </span>
      </li>
    );
  };

  const visiveis = lista.slice(0, pagina * POR_PAGINA);
  const exibida = zoom ?? comandante;

  return (
    <div class="mt">
      <header class="mt-topo">
        <button class="botao fantasma" onClick={voltar}>Voltar aos decks</button>
        <input class="mt-nome" value={nome} maxLength={60} placeholder="Nome do deck" aria-label="Nome do deck"
          onInput={(ev) => { const v = (ev.target as HTMLInputElement).value; mudar(() => setNome(v)); }} />
        {rascunho && (mexeu || comandante) && <button class="botao fantasma" onClick={recomecar}>Começar do zero</button>}
        <button class="botao cheio" disabled={salvando || !comandante || !nome.trim()} onClick={salvar}>
          {salvando ? 'Gravando…' : inicial.id ? 'Gravar as mudanças' : 'Gravar o deck'}
        </button>
      </header>

      <div class="mt-corpo">
        {/* a coleção */}
        <section class="mt-colecao" aria-label="Cartas disponíveis">
          <div class="mt-aviso-modo">
            {escolhendo === 'comandante' && <p><b>Escolha o comandante.</b> Aparecem as cartas lendárias que podem comandar um deck. A identidade de cor dele define as cartas que o deck pode ter.</p>}
            {escolhendo === 'parceiro' && <p><b>Escolha o parceiro de {nomeDe(comandante!)}.</b> Só aparecem as cartas que formam dupla com ele.</p>}
            {escolhendo && comandante && <button class="botao pequeno fantasma" onClick={() => setEscolhendo(null)}>Cancelar</button>}
            {!escolhendo && <p class="suave">Clique numa carta para pôr no deck. Só aparecem as que cabem na identidade de cor do comandante.</p>}
          </div>
          <div class="mt-filtros">
            <input type="search" value={busca} placeholder="Buscar por nome, tipo ou texto (português ou inglês)" aria-label="Buscar cartas"
              onInput={(ev) => setBusca((ev.target as HTMLInputElement).value)} spellcheck={false} />
            <select value={grupo} aria-label="Tipo" onChange={(ev) => setGrupo((ev.target as HTMLSelectElement).value as Grupo | 'todos')}>
              <option value="todos">Todos os tipos</option>
              {GRUPOS.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
            </select>
            <select value={ordem} aria-label="Ordem" onChange={(ev) => setOrdem((ev.target as HTMLSelectElement).value as 'nome' | 'custo')}>
              <option value="nome">Por nome</option>
              <option value="custo">Por custo</option>
            </select>
            <span class="mt-cores" role="group" aria-label="Cores">
              {CORES.filter((c) => escolhendo || c.id === 'C' || identidade.has(c.id)).map((c) => (
                <button key={c.id} type="button" class={`mt-cor ${cores.includes(c.id) ? 'ligada' : ''}`} title={c.nome} aria-pressed={cores.includes(c.id)}
                  onClick={() => setCores((l) => (l.includes(c.id) ? l.filter((x) => x !== c.id) : [...l, c.id]))}>
                  <Simbolos custo={`{${c.id}}`} tam={18} />
                </button>
              ))}
            </span>
          </div>
          {todas === null
            ? <p class="suave">Carregando as cartas…</p>
            : (
              <>
                <p class="suave mt-conta">{lista.length === 1 ? '1 carta' : `${lista.length} cartas`}{escolhendo ? '' : ` · ${todas.length} no jogo`}</p>
                <ul class="mt-grade">
                  {visiveis.map((c) => {
                    const q = qtd(c.nome);
                    const cheia = !escolhendo && q >= maximo(c);
                    return (
                      <li key={c.nome}>
                        <button type="button" class={`mt-carta ${q ? 'no-deck' : ''} ${cheia ? 'cheia' : ''}`} disabled={cheia}
                          title={`${nomeDe(c.nome)}${info(c.nome)?.pt ? ` (${c.nome})` : ''}`}
                          onClick={() => clicarNaColecao(c)} onMouseEnter={() => setZoom(c.nome)} onMouseLeave={() => setZoom(null)}>
                          <Miniatura nome={c.nome} />
                          {q > 0 && <span class="mt-selo">{q}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {visiveis.length < lista.length && (
                  <button class="botao mt-mais" onClick={() => setPagina((p) => p + 1)}>Mostrar mais ({lista.length - visiveis.length})</button>
                )}
              </>
            )}
        </section>

        {/* o deck */}
        <aside class="mt-deck" aria-label="O deck">
          <div class="mt-zoom">
            {exibida ? <Miniatura nome={exibida} tam="m" /> : <span class="mt-img sem-imagem">Sem comandante</span>}
          </div>
          <div class="mt-comandantes">
            <div class="mt-cmd">
              <span class="rot">Comandante</span>
              <b>{comandante ? nomeDe(comandante) : '—'}</b>
              <button class="botao pequeno" onClick={() => setEscolhendo('comandante')}>{comandante ? 'Trocar' : 'Escolher'}</button>
            </div>
            {parceiro && (
              <div class="mt-cmd">
                <span class="rot">Parceiro</span>
                <b>{nomeDe(parceiro)}</b>
                <button class="botao pequeno fantasma" onClick={() => mudar(() => setParceiro(null))}>Tirar</button>
              </div>
            )}
            {!parceiro && cmd?.parceiros?.length ? <button class="botao pequeno fantasma" onClick={() => setEscolhendo('parceiro')}>Pôr um parceiro</button> : null}
          </div>

          <div class={`mt-total ${total === 100 ? 'ok' : total > 100 ? 'passou' : ''}`}>
            <span><b>{total}</b> de 100 cartas</span>
            <span class="cat-barra"><span style={{ width: `${Math.min(100, total)}%` }} /></span>
            <span class="suave">{terrenos === 1 ? '1 terreno' : `${terrenos} terrenos`}</span>
          </div>

          {comandante && basicos.length > 0 && (
            <div class="mt-basicos">
              {basicos.map((b) => (
                <span key={b} class="mt-basico">
                  <span>{nomeDe(b)}</span>
                  <button type="button" class="mt-mm" aria-label={`Tirar uma ${nomeDe(b)}`} disabled={!qtd(b)} onClick={() => somar(b, -1)}>−</button>
                  <b>{qtd(b)}</b>
                  <button type="button" class="mt-mm" aria-label={`Pôr uma ${nomeDe(b)}`} onClick={() => somar(b, 1)}>+</button>
                </span>
              ))}
            </div>
          )}

          <div class="mt-curva" aria-label="Curva de mana (sem terrenos)">
            {curva.map((n, i) => (
              <span key={i} class="mt-barra" title={`${i === 7 ? '7 ou mais' : i}: ${n}`}>
                <span style={{ height: `${Math.round((100 * n) / topoCurva)}%` }} />
                <small>{i === 7 ? '7+' : i}</small>
              </span>
            ))}
          </div>

          {(problemas.length > 0 || falhas) && (
            <div class="mt-problemas">
              {falhas && <p class="cat-erro"><b>{falhas.erro}</b></p>}
              <ul>
                {(falhas?.erros.length ? falhas.erros : problemas).map((p) => <li key={p}>{p}</li>)}
              </ul>
              {fora.length > 0 && <button class="botao pequeno" onClick={() => mudar(() => setCartas((c) => { const novo = { ...c }; for (const n of fora) delete novo[n]; return novo; }))}>Tirar as {fora.length} fora da identidade</button>}
            </div>
          )}

          <div class="mt-lista">
            {porGrupo.length === 0 && <p class="suave">{comandante ? 'O deck ainda não tem cartas.' : 'Escolha o comandante para começar.'}</p>}
            {porGrupo.map((g) => (
              <section key={g.id}>
                <h3 class="rot">{g.nome} ({g.cartas.reduce((s, n) => s + cartas[n], 0)})</h3>
                <ul>{g.cartas.map(linhaDeck)}</ul>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export const deckVazio = (): DeckInicial => ({ ...VAZIO, cartas: {} });
