// A mesa: as áreas dos jogadores (com a sua mão), a faixa de fases, a coluna com a pilha e a
// decisão pendente, e a barra lateral retrátil com o registro.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { StopSettings } from '../../../motor/autopass.ts';
import type { Decision, ManualAction, ObjId, PaymentSource, PriorityAction, Step, TargetRef } from '../../../motor/types.ts';
import type { GameView, ObjView, PlayerView } from '../../../motor/view.ts';
import { nomeCarta, traduzir, urlArte, urlImagem } from '../cartas.ts';
import { IconeAjuste, IconeConceder, IconeRecolher as IconeSeta, IconeConfig, IconeFimTurno, IconeParadas, IconePassar, IconeRecolher, IconeRegistro, IconeSair, Marca } from '../icones.tsx';
import { loja, useLoja } from '../loja.ts';
import { reservaPaga } from '../mana.ts';
import { Janela } from '../Janela.tsx';
import { mudarPreferencias, usePreferencias } from '../preferencias.ts';
import { ETAPAS, FASES } from '../pt.ts';
import { acompanharArrasto, dentro, mostrarFantasma, useFantasma } from './arrastar.ts';
import { AreaJogador, type Legenda } from './AreaJogador.tsx';
import { Carta, type Realce } from './Carta.tsx';
import { Decisao, type EstadoUi } from './Decisao.tsx';
import { MaoInicial } from './MaoInicial.tsx';
import { Manual, type PegarCarta, type Tipo as TipoManual } from './Manual.tsx';
import { Paradas } from './Paradas.tsx';
import { TextoComSimbolos } from './Simbolos.tsx';
import { Zoom } from './Zoom.tsx';

type Modal = { tipo: 'zona'; jogador: number; zona: 'graveyard' | 'exile' } | { tipo: 'paradas' } | { tipo: 'conceder' } | { tipo: 'config' } | { tipo: 'carta'; o: ObjView } | null;
type ItemMenu =
  | { tipo?: 'acao'; id: string; label: string; fazer: () => void; legal?: boolean; desativado?: boolean }
  | { tipo: 'grupo'; id: string; label: string }
  | { tipo: 'sub'; id: string; label: string; itens: ItemMenu[]; desativado?: boolean }
  | { tipo: 'contador'; id: string; label: string; menos: () => void; mais: () => void; desativado?: boolean };
interface Menu { titulo: string; itens: ItemMenu[]; x: number; y: number }

const DESTINOS: [Extract<ManualAction, { k: 'mover' }>['to'], string][] = [
  ['battlefield', 'Campo'], ['hand', 'Mão'], ['graveyard', 'Cemitério'], ['exile', 'Exílio'], ['libraryTop', 'Topo do grimório'], ['libraryBottom', 'Fundo do grimório'],
];
const MARCAS_CARTA: [string, string][] = [['+1/+1', '+1/+1'], ['-1/-1', '−1/−1'], ['loyalty', 'Lealdade'], ['charge', 'Carga'], ['shield', 'Escudo'], ['stun', 'Atordoamento'], ['time', 'Tempo'], ['oil', 'Óleo']];
const MARCAS_JOGADOR: [string, string][] = [['poison', 'Veneno'], ['energy', 'Energia'], ['experience', 'Experiência'], ['rad', 'Radiação']];

/** menu flutuante (clique na carta ou clique direito), com grupos, submenus e contadores −/+ */
function MenuFlutuante({ menu, fechar }: { menu: Menu; fechar: () => void }) {
  const [aberto, setAberto] = useState<string | null>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const caixaSub = useRef<HTMLDivElement>(null);
  const [sub, setSub] = useState<{ itens: ItemMenu[]; x: number; y: number } | null>(null);
  // a altura real só se sabe depois de desenhar: sobe o menu se ele passar da borda de baixo
  useLayoutEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > innerHeight - 8) el.style.top = `${Math.max(8, innerHeight - 8 - r.height)}px`;
  }, [menu]);
  useLayoutEffect(() => {
    const el = caixaSub.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > innerHeight - 8) el.style.top = `${Math.max(8, innerHeight - 8 - r.height)}px`;
  }, [sub]);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, [fechar]);
  const abrir = (it: Extract<ItemMenu, { tipo: 'sub' }>, el: HTMLElement) => {
    if (it.desativado) return;
    const r = el.getBoundingClientRect();
    const x = r.right + 220 < innerWidth ? r.right + 4 : r.left - 224;
    setAberto(it.id);
    setSub({ itens: it.itens, x, y: Math.min(r.top - 6, innerHeight - 40 - it.itens.length * 36) });
  };
  const linha = (it: ItemMenu, emSub: boolean) => {
    if (it.tipo === 'grupo') return <p key={it.id} class="menu-grupo">{it.label}</p>;
    if (it.tipo === 'contador') {
      return (
        <div key={it.id} class={`menu-contador ${it.desativado ? 'desativado' : ''}`}>
          <span>{it.label}</span>
          <button class="botao pequeno icone" aria-label={`Tirar um marcador ${it.label}`} disabled={it.desativado} onClick={it.menos}>−</button>
          <button class="botao pequeno icone" aria-label={`Pôr um marcador ${it.label}`} disabled={it.desativado} onClick={it.mais}>+</button>
        </div>
      );
    }
    if (it.tipo === 'sub') {
      return (
        <button key={it.id} class={`botao menu-item ${aberto === it.id ? 'aberto' : ''}`} role="menuitem" disabled={it.desativado}
          onMouseEnter={emSub ? undefined : (e) => abrir(it, e.currentTarget as HTMLElement)} onClick={(e) => abrir(it, e.currentTarget as HTMLElement)}>
          <span>{it.label}</span><IconeSeta />
        </button>
      );
    }
    return (
      <button key={it.id} class={`botao menu-item ${it.legal ? 'acao' : ''}`} role="menuitem" disabled={it.desativado}
        onMouseEnter={emSub ? undefined : () => { setAberto(null); setSub(null); }} onClick={() => { fechar(); it.fazer(); }}>
        <TextoComSimbolos texto={traduzir(it.label)} />
      </button>
    );
  };
  return (
    <>
      <div ref={caixa} class="menu-acoes" role="menu" style={{ left: `${menu.x}px`, top: `${menu.y}px` }} onClick={(ev) => ev.stopPropagation()} onContextMenu={(ev) => ev.preventDefault()}>
        <p class="menu-titulo">{menu.titulo}</p>
        {menu.itens.map((it) => linha(it, false))}
        <button class="botao menu-item fantasma" onClick={fechar}>Cancelar</button>
      </div>
      {sub && (
        <div ref={caixaSub} class="menu-acoes submenu" role="menu" style={{ left: `${sub.x}px`, top: `${sub.y}px` }} onClick={(ev) => ev.stopPropagation()} onContextMenu={(ev) => ev.preventDefault()}>
          {sub.itens.map((it) => linha(it, true))}
        </div>
      )}
    </>
  );
}

/** cor de cada jogador na sua tela: você em amarelo, os outros na ordem dos assentos */
const CORES = ['var(--amarelo)', 'var(--vermelho)', 'var(--azul)', 'var(--roxo)'];
const PARAVEIS = new Set<Step>(ETAPAS.map((e) => e.id).filter((s) => !['untap', 'cleanup', 'firstStrikeDamage'].includes(s)));
const CHAVE_LATERAL = 'commander-da-mesa:lateral-recolhida';

function lerRecolhida(): boolean {
  try { return localStorage.getItem(CHAVE_LATERAL) === '1'; } catch { return false; }
}
function guardarRecolhida(v: boolean): void {
  try { localStorage.setItem(CHAVE_LATERAL, v ? '1' : '0'); } catch { /* sem armazenamento */ }
}

function rotuloDecisao(d: Decision): string {
  switch (d.kind) {
    case 'payment': return 'Pagamento';
    case 'attackers': case 'blockers': case 'damage': return 'Fase de combate';
    case 'mulligan': return 'Início da partida';
    case 'priority': return 'Prioridade';
    default: return 'Sua escolha';
  }
}

interface FaixaProps {
  v: GameView;
  eu: number;
  d: Decision | null;
  enviando: boolean;
  paradas: StopSettings | null;
  cor: (p: number) => string;
}

function FaixaFases({ v, eu, d, enviando, paradas, cor }: FaixaProps) {
  const passo = v.turn.step;
  const iFase = FASES.findIndex((f) => f.etapas.includes(passo));
  const contexto = v.turn.active === eu ? 'myTurn' : 'othersTurn';
  const temParada = (s: Step) => !!paradas?.[contexto].includes(s);
  const alternar = (s: Step) => {
    if (!paradas || !PARAVEIS.has(s)) return;
    const lista = temParada(s) ? paradas[contexto].filter((x) => x !== s) : [...paradas[contexto], s];
    const novo = { ...paradas, [contexto]: lista };
    loja.mudar({ paradas: novo });
    loja.enviar({ t: 'paradas', paradas: novo });
  };
  const dica = (s: Step) => `${temParada(s) ? 'Não parar' : 'Parar'} aqui ${contexto === 'myTurn' ? 'no seu turno' : 'no turno dos outros'}`;
  const nomeEtapa = (s: Step) => ETAPAS.find((e) => e.id === s)!;

  let acao;
  if (v.gameOver) acao = <span class="prioridade">Partida<b>encerrada</b></span>;
  else if (d && enviando) acao = <span class="prioridade"><b>Enviando…</b></span>;
  else if (d?.kind === 'priority') {
    acao = (<>
      <span class="prioridade">Você tem <b>prioridade</b></span>
      <button class="botao cheio" onClick={() => loja.responder(d.id, { kind: 'priority', action: 'pass' })}><IconePassar />Passar</button>
      <button class="botao icone" title="Passar até o fim do turno" aria-label="Passar até o fim do turno" onClick={() => { loja.enviar({ t: 'passarTurno' }); loja.responder(d.id, { kind: 'priority', action: 'pass' }); }}><IconeFimTurno /></button>
    </>);
  } else if (d) acao = <span class="prioridade">Sua vez de <b>decidir</b></span>;
  else if (v.waiting) acao = <span class="prioridade" style={{ '--cor': cor(v.waiting.player) }}>Esperando <b>{v.players[v.waiting.player]?.name}…</b></span>;

  return (
    <div class="fases" aria-label="Fases do turno">
      <div class="fases-turno turno-linha" title={`Turno de ${v.players[v.turn.active].name}`}><span class="rot">Turno</span><strong>{v.turn.number}</strong></div>
      <ol class="fases-lista">
        {FASES.map((f, i) => {
          const atual = i === iFase;
          const principal = f.etapas.length === 1;
          const s0 = f.etapas[0];
          const classe = `fase ${atual ? 'atual' : i < iFase ? 'passada' : ''} ${principal && temParada(s0) ? 'parada' : ''}`;
          const etapas = atual && !principal ? f.etapas.filter((s) => s !== 'firstStrikeDamage' || passo === s) : [];
          const iEtapa = f.etapas.indexOf(passo);
          return (
            <li key={f.id} class={classe} title={principal ? dica(s0) : f.nome} onClick={principal ? () => alternar(s0) : undefined} style={principal ? { cursor: 'pointer' } : undefined}>
              <span class="longo">{f.nome}</span><span class="curto">{f.curto}</span>
              {etapas.length > 0 && (
                <ol class="etapas">
                  {etapas.map((s) => {
                    const k = f.etapas.indexOf(s);
                    const cls = `etapa ${s === passo ? 'atual' : k < iEtapa ? 'passada' : ''} ${temParada(s) ? 'parada' : ''}`;
                    return PARAVEIS.has(s)
                      ? <li key={s}><button type="button" class={cls} title={dica(s)} onClick={() => alternar(s)}>{nomeEtapa(s).curto}</button></li>
                      : <li key={s} class={cls} title={nomeEtapa(s).nome}>{nomeEtapa(s).curto}</li>;
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
      {acao && <div class="fases-acao">{acao}</div>}
    </div>
  );
}

/** avisos curtos do que acabou de acontecer (jogadas, ataques, ajustes manuais) */
function Avisos({ v, cor }: { v: GameView; cor: (p: number) => string }) {
  const [lista, setLista] = useState<{ id: number; texto: string; quem: number | null }[]>([]);
  const anterior = useRef<GameView['log'] | null>(null);
  const seq = useRef(0);
  useEffect(() => {
    const ant = anterior.current;
    anterior.current = v.log;
    if (!ant) return;
    const ultima = ant[ant.length - 1];
    let k = -1;
    if (ultima) for (let i = v.log.length - 1; i >= 0; i--) if (v.log[i].turn === ultima.turn && v.log[i].text === ultima.text) { k = i; break; }
    const novas = v.log.slice(k + 1).filter((l) => / (joga|conjura|ativa|revela) |ataca:|perde a partida|vence a partida|\(ajuste manual\)/.test(l.text));
    if (!novas.length) return;
    const itens = novas.slice(-3).map((l) => ({ id: seq.current++, texto: traduzir(l.text), quem: v.players.find((p) => l.text.startsWith(`${p.name} `) || l.text.startsWith(`${p.name}:`))?.id ?? null }));
    setLista((a) => [...a, ...itens].slice(-3));
    const ids = new Set(itens.map((i) => i.id));
    setTimeout(() => setLista((a) => a.filter((x) => !ids.has(x.id))), 5000);
  }, [v.log]);
  if (!lista.length) return null;
  return (
    <div class="avisos" aria-live="polite">
      {lista.map((a) => {
        const nome = a.quem !== null ? v.players[a.quem].name : null;
        return (
          <div key={a.id} class="aviso" style={{ '--cor': a.quem !== null ? cor(a.quem) : 'var(--texto)' }}>
            {nome ? <><b>{nome}</b>{a.texto.slice(nome.length)}</> : a.texto}
          </div>
        );
      })}
    </div>
  );
}

/** a carta que segue o ponteiro durante um arrasto, e a área onde soltar */
function CamadaArrasto() {
  const f = useFantasma();
  if (!f) return null;
  return (
    <>
      {f.alvo && f.texto && (
        <div class={`alvo-soltar ${f.valido ? '' : 'invalido'}`} style={{ left: `${f.alvo.left}px`, top: `${f.alvo.top}px`, width: `${f.alvo.width}px`, height: `${f.alvo.height}px` }}>
          <span>{f.texto}</span>
        </div>
      )}
      <div class={`arrasto-fantasma ${f.voltando ? 'voltando' : ''}`} style={{ left: `${f.x}px`, top: `${f.y}px` }}>
        <Carta o={{ ...f.o, tapped: !!f.virada }} estilo={{ '--w': `${f.w}px` }} />
      </div>
    </>
  );
}

export function Mesa() {
  const e = useLoja();
  const v = e.vista!;
  const sala = e.sala!;
  const eu = v.you!;
  const d = v.decision;
  const enviando = !!d && e.respondida === d.id;

  // estado da interface que vale só para a decisão atual
  const [sel, setSel] = useState<string[]>([]);
  const [ataques, setAtaques] = useState<Record<number, TargetRef>>({});
  const [bloqueios, setBloqueios] = useState<Record<number, ObjId>>({});
  const [bloqueadorAtivo, setBloqueadorAtivo] = useState<ObjId | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [zoom, setZoom] = useState<{ o: ObjView; lado: 'esq' | 'dir' } | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [pegar, setPegar] = useState<PegarCarta | null>(null);
  const [manualAberto, setManualAberto] = useState(false);
  const [recolhida, setRecolhida] = useState(lerRecolhida);
  const [registroAberto, setRegistroAberto] = useState(true);
  const [arrastando, setArrastando] = useState<ObjId | null>(null);
  // ajustes manuais em sequência (ex.: desvirar tudo): um por decisão de prioridade
  const [fila, setFila] = useState<ManualAction[]>([]);
  const [manualTipo, setManualTipo] = useState<TipoManual | undefined>(undefined);
  // posição que você acabou de escolher, até o servidor confirmar
  const [posLocal, setPosLocal] = useState<Record<string, [number, number]>>({});
  const pref = usePreferencias();
  const autoFeito = useRef(new Set<number>());
  useEffect(() => { setSel([]); setAtaques({}); setBloqueios({}); setBloqueadorAtivo(null); setMenu(null); }, [d?.id]);
  const recolher = (x: boolean) => { setRecolhida(x); guardarRecolhida(x); };
  // a carta sob o mouse some junto com a janela (o mouseleave não chega)
  useEffect(() => { setZoom(null); }, [modal]);

  const ui: EstadoUi = { sel, setSel, ataques, setAtaques, bloqueios, setBloqueios, bloqueadorAtivo, setBloqueadorAtivo };
  const minhaReserva = v.players[eu]?.manaPool ?? '';

  // pagamento: automático se a pessoa preferir; senão confirma sozinho quando a reserva cobre o custo
  useEffect(() => {
    if (d?.kind !== 'payment' || enviando || autoFeito.current.has(d.id)) return;
    if (pref.pagarAuto && d.canAuto) { autoFeito.current.add(d.id); loja.responder(d.id, { kind: 'payment', auto: true }); return; }
    if (d.lifeOptions === 0 && minhaReserva && reservaPaga(d.cost, minhaReserva) === true) { autoFeito.current.add(d.id); loja.responder(d.id, { kind: 'payment', pay: true }); }
  }, [d?.id, enviando, minhaReserva, pref.pagarAuto]);
  useEffect(() => {
    if (!fila.length || enviando || d?.kind !== 'priority' || !d.actions.some((a) => a.kind === 'manual')) return;
    loja.manual(d.id, fila[0]);
    setFila(fila.slice(1));
  }, [d?.id, enviando, fila]);
  // a confirmação do servidor substitui a posição local
  useEffect(() => { setPosLocal({}); }, [e.posicoes]);
  const posicoes = useMemo(() => ({ ...e.posicoes, ...posLocal }), [e.posicoes, posLocal]);

  // índice de objetos visíveis
  const todos = useMemo(() => {
    const m = new Map<ObjId, ObjView>();
    for (const o of [...v.battlefield, ...v.hand, ...v.exile, ...v.command, ...v.players.flatMap((p) => p.graveyard)]) m.set(o.id, o);
    return m;
  }, [v]);
  const nomeObj = (id: ObjId) => { const o = todos.get(id); return o ? nomeCarta(o.def, o.name) : (v.stack.find((s) => s.id === id)?.name ?? `objeto ${id}`); };
  const nomeAlvo = (t: TargetRef) => (t.kind === 'player' ? v.players[t.id].name : nomeObj(t.id));

  // ordem dos assentos a partir de mim, e a cor de cada um
  const ordem = useMemo(() => {
    const i = v.turnOrder.indexOf(eu);
    return [...v.turnOrder.slice(i), ...v.turnOrder.slice(0, i)];
  }, [v.turnOrder, eu]);
  const cor = (p: number) => CORES[Math.max(0, ordem.indexOf(p)) % CORES.length];

  // o que cada carta pode fazer na decisão atual
  const itemPorObj = useMemo(() => {
    const m = new Map<ObjId, string>();
    if (d?.kind === 'select') for (const it of d.items) if (it.obj !== undefined && !it.disabled) m.set(it.obj, it.id);
    return m;
  }, [d]);
  const itemPorJogador = useMemo(() => {
    const m = new Map<number, string>();
    if (d?.kind === 'select') for (const it of d.items) if (it.player !== undefined && !it.disabled) m.set(it.player, it.id);
    return m;
  }, [d]);
  const acoesPorObj = useMemo(() => {
    const m = new Map<ObjId, PriorityAction[]>();
    if (d?.kind === 'priority') for (const a of d.actions) if (a.obj !== undefined) m.set(a.obj, [...(m.get(a.obj) ?? []), a]);
    return m;
  }, [d]);
  const fontesPorObj = useMemo(() => {
    const m = new Map<ObjId, PaymentSource[]>();
    if (d?.kind === 'payment') for (const f of d.sources) m.set(f.obj, [...(m.get(f.obj) ?? []), f]);
    return m;
  }, [d]);
  // ações que não estão presas a nenhuma carta à vista ficam num painel próprio
  const acoesSoltas = d?.kind === 'priority' ? d.actions.filter((a) => !['pass', 'manual', 'mana'].includes(a.kind) && (a.obj === undefined || !todos.has(a.obj))) : [];
  const atacantesCand = d?.kind === 'attackers' ? new Map(d.candidates.map((c) => [c.obj, c.targets])) : null;
  const bloqueadoresCand = d?.kind === 'blockers' ? new Map(d.candidates.map((c) => [c.obj, c.canBlock])) : null;
  const atacando = new Map((v.combat?.attackers ?? []).map((a) => [a.id, a]));
  const bloqueando = new Map((v.combat?.attackers ?? []).flatMap((a) => a.blockers.map((b) => [b, a.id] as const)));

  const realce = (o: ObjView): Realce => {
    if (pegar) return 'escolhivel';
    if (d?.kind === 'select') {
      const id = itemPorObj.get(o.id);
      if (id === undefined) return null;
      return sel.includes(id) ? 'escolhido' : 'escolhivel';
    }
    if (d?.kind === 'payment') return !enviando && fontesPorObj.has(o.id) ? 'acao' : null;
    if (d?.kind === 'priority') return acoesPorObj.get(o.id)?.some((a) => a.kind !== 'mana') ? 'acao' : null;
    if (atacantesCand) return ataques[o.id] ? 'atacante' : atacantesCand.has(o.id) ? 'escolhivel' : null;
    if (bloqueadoresCand) {
      if (bloqueadorAtivo === o.id) return 'ativo';
      if (bloqueios[o.id] !== undefined) return 'bloqueador';
      if (bloqueadorAtivo !== null && bloqueadoresCand.get(bloqueadorAtivo)?.includes(o.id)) return 'mira';
      if (bloqueadoresCand.get(o.id)?.length) return 'escolhivel';
    }
    if (atacando.has(o.id)) return 'atacante';
    if (bloqueando.has(o.id)) return 'bloqueador';
    return null;
  };
  const legenda = (o: ObjView): Legenda | undefined => {
    const at = ataques[o.id] ?? atacando.get(o.id)?.target;
    if (at) return { texto: `ataca ${nomeAlvo(at)}`, bloqueio: false };
    const b = bloqueios[o.id] ?? bloqueando.get(o.id);
    if (b !== undefined) return { texto: `bloqueia ${nomeObj(b)}`, bloqueio: true };
    return undefined;
  };

  const fazerAcao = (a: PriorityAction) => { if (d) loja.responder(d.id, { kind: 'priority', action: a.id }); };
  const abrirMenu = (titulo: string, itens: ItemMenu[], r: DOMRect) => {
    const largura = 260, altura = 92 + itens.length * 38;
    const x = r.right + 10 + largura < innerWidth ? r.right + 10 : Math.max(8, r.left - largura - 10);
    const y = Math.max(8, Math.min(r.top, innerHeight - altura - 8));
    setMenu({ titulo, itens, x, y });
  };
  const legais = (itens: ItemMenu[]) => itens.map((i) => ({ ...i, legal: true }) as ItemMenu);

  // jogar uma carta da mão (duplo clique ou arrastar para o campo)
  const jogadasDe = (o: ObjView) => (d?.kind === 'priority' && !enviando ? (acoesPorObj.get(o.id) ?? []).filter((a) => a.kind === 'play' || a.kind === 'cast') : []);
  const motivo = (o: ObjView): string => {
    if (v.gameOver) return 'A partida acabou';
    if (enviando) return 'Espere a jogada anterior terminar';
    if (!d) return v.waiting ? `Agora é a vez de ${v.players[v.waiting.player]?.name} decidir` : 'Espere a sua prioridade';
    if (d.kind !== 'priority') return 'Termine a decisão atual primeiro';
    const meuTurno = v.turn.active === eu;
    const principal = v.turn.step === 'main1' || v.turn.step === 'main2';
    if (o.types.includes('Land')) {
      if (!meuTurno) return 'Terrenos só no seu turno';
      if (v.stack.length) return 'Terrenos só com a pilha vazia';
      if (!principal) return 'Terrenos só na fase principal';
      return 'Você já jogou um terreno neste turno';
    }
    const rapida = o.types.includes('Instant') || o.keywords.includes('flash');
    if (!rapida && (!meuTurno || !principal || v.stack.length)) return 'Só na sua fase principal, com a pilha vazia';
    return 'Falta mana, alvo válido ou outra condição para conjurar agora';
  };
  const jogar = (o: ObjView, r: DOMRect) => {
    const j = jogadasDe(o);
    setMenu(null);
    if (j.length === 1) fazerAcao(j[0]);
    else if (j.length > 1) abrirMenu(nomeObj(o.id), legais(j.map((a) => ({ id: a.id, label: a.label, fazer: () => fazerAcao(a) }))), r);
    else loja.erro(motivo(o));
  };
  const pegarMao = (o: ObjView, ev: PointerEvent, el: HTMLElement) => {
    if (pegar) return;
    acompanharArrasto(ev, () => {
      const r0 = el.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      const dx = ev.clientX - r0.left, dy = ev.clientY - r0.top;
      const campo = document.querySelector('.area-eu .campo') as HTMLElement | null;
      const alvo = campo?.getBoundingClientRect() ?? null;
      const j = jogadasDe(o);
      const nome = nomeObj(o.id);
      const texto = j.length ? `Solte para ${o.types.includes('Land') ? 'jogar' : 'conjurar'} ${nome}` : motivo(o);
      const base = { o, w, alvo, texto, valido: j.length > 0 };
      return {
        inicio: () => { setMenu(null); setZoom(null); setArrastando(o.id); mostrarFantasma({ ...base, x: ev.clientX - dx, y: ev.clientY - dy }); },
        mover: (x: number, y: number) => mostrarFantasma({ ...base, x: x - dx, y: y - dy }),
        soltar: (x: number, y: number) => {
          if (dentro(alvo, x, y) && j.length) {
            mostrarFantasma(null); setArrastando(null);
            jogar(o, new DOMRect(x - dx, y - dy, w, h));
            return;
          }
          if (dentro(alvo, x, y)) loja.erro(base.texto);
          // volta para a mão
          mostrarFantasma({ ...base, x: r0.left, y: r0.top, voltando: true });
          setTimeout(() => { mostrarFantasma(null); setArrastando(null); }, 220);
        },
        cancelar: () => { mostrarFantasma(null); setArrastando(null); },
      };
    });
  };
  // combate: arrastar a criatura até a área de quem ela ataca, ou o bloqueador até o atacante
  const pegarCombate = (o: ObjView, ev: PointerEvent, el: HTMLElement): boolean => {
    const alvosAtaque = atacantesCand?.get(o.id);
    const bloqueaveis = bloqueadoresCand?.get(o.id);
    if (!alvosAtaque?.length && !bloqueaveis?.length) return false;
    acompanharArrasto(ev, () => {
      const r0 = el.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      const cx = ev.clientX - (r0.left + r0.width / 2), cy = ev.clientY - (r0.top + r0.height / 2);
      const canto = (x: number, y: number) => ({ x: x - cx - w / 2, y: y - cy - h / 2 });
      const texto = alvosAtaque?.length ? 'Solte na área de quem ela vai atacar' : 'Solte em cima da criatura que ela vai bloquear';
      const base = { o, w, alvo: null, texto, valido: true, virada: o.tapped };
      return {
        inicio: () => { setMenu(null); setZoom(null); setArrastando(o.id); mostrarFantasma({ ...base, ...canto(ev.clientX, ev.clientY) }); },
        mover: (x: number, y: number) => mostrarFantasma({ ...base, ...canto(x, y) }),
        soltar: (x: number, y: number) => {
          mostrarFantasma(null); setArrastando(null);
          const sob = document.elementsFromPoint(x, y) as HTMLElement[];
          if (alvosAtaque?.length) {
            // em cima de um planeswalker/batalha atacável, ou da área de um jogador
            const carta = sob.map((e) => e.closest('[data-obj]') as HTMLElement | null).find((e) => e && alvosAtaque.some((t) => t.kind === 'obj' && t.id === Number(e.dataset.obj)));
            const area = sob.map((e) => e.closest('[data-jogador]') as HTMLElement | null).find(Boolean);
            const t = carta ? alvosAtaque.find((a) => a.kind === 'obj' && a.id === Number(carta.dataset.obj))
              : area ? alvosAtaque.find((a) => a.kind === 'player' && a.id === Number(area.dataset.jogador)) : undefined;
            if (t) setAtaques({ ...ataques, [o.id]: t });
            return;
          }
          const carta = sob.map((e) => e.closest('[data-obj]') as HTMLElement | null).find((e) => e && bloqueaveis!.includes(Number(e.dataset.obj)));
          if (carta) { setBloqueios({ ...bloqueios, [o.id]: Number(carta.dataset.obj) }); setBloqueadorAtivo(null); }
        },
        cancelar: () => { mostrarFantasma(null); setArrastando(null); },
      };
    });
    return true;
  };

  // mover uma permanente sua para outro lugar da sua área
  const pegarCampo = (o: ObjView, ev: PointerEvent, el: HTMLElement) => {
    if (pegar) return;
    if (pegarCombate(o, ev, el)) return;
    acompanharArrasto(ev, () => {
      const campo = el.closest('.campo') as HTMLElement;
      const rc = campo.getBoundingClientRect();
      const r0 = el.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      // o centro da carta segue o ponteiro (vale também para a carta virada)
      const cx = ev.clientX - (r0.left + r0.width / 2), cy = ev.clientY - (r0.top + r0.height / 2);
      const canto = (x: number, y: number) => ({ x: x - cx - w / 2, y: y - cy - h / 2 });
      const base = { o, w, alvo: rc, texto: '', valido: true, virada: o.tapped };
      return {
        inicio: () => { setMenu(null); setZoom(null); setArrastando(o.id); mostrarFantasma({ ...base, ...canto(ev.clientX, ev.clientY) }); },
        mover: (x: number, y: number) => mostrarFantasma({ ...base, ...canto(x, y) }),
        soltar: (x: number, y: number) => {
          const c = canto(x, y);
          const nx = Math.min(1, Math.max(0, (c.x - rc.left) / rc.width)), ny = Math.min(1, Math.max(0, (c.y - rc.top) / rc.height));
          setPosLocal((a) => ({ ...a, [o.id]: [nx, ny] }));
          loja.enviar({ t: 'posicao', obj: o.id, x: nx, y: ny });
          mostrarFantasma(null); setArrastando(null);
        },
        cancelar: () => { mostrarFantasma(null); setArrastando(null); },
      };
    });
  };

  // clique direito: jogadas válidas, ver a carta, revelar e o ajuste manual
  const decisaoManualId = d?.kind === 'priority' && d.actions.some((a) => a.kind === 'manual') ? d.id : null;
  const manualOk = decisaoManualId !== null && !enviando && !fila.length;
  const manual = (m: ManualAction) => { if (decisaoManualId !== null) loja.manual(decisaoManualId, m); };
  const grupoManual: ItemMenu = { tipo: 'grupo', id: 'g-manual', label: manualOk ? 'Ajuste manual' : 'Ajuste manual (só com prioridade)' };
  const menuCarta = (o: ObjView, ev: MouseEvent) => {
    if (pegar) return;
    setZoom(null);
    const naMao = v.hand.some((x) => x.id === o.id);
    const noCampo = v.battlefield.some((x) => x.id === o.id);
    const itens: ItemMenu[] = [];
    if (d?.kind === 'priority' && !enviando) for (const a of acoesPorObj.get(o.id) ?? []) itens.push({ id: a.id, label: a.label, legal: true, fazer: () => fazerAcao(a) });
    if (d?.kind === 'payment' && !enviando) for (const f of fontesPorObj.get(o.id) ?? []) itens.push({ id: f.id, label: f.label, legal: true, fazer: () => loja.responder(d.id, { kind: 'payment', activate: { source: f.id } }) });
    if (o.def) itens.push({ id: 'ver', label: 'Ver informações', fazer: () => setModal({ tipo: 'carta', o }) });
    if (naMao && !v.gameOver) {
      itens.push({ tipo: 'sub', id: 'revelar', label: 'Revelar', itens: [
        { id: 'r-todos', label: 'Para todos', fazer: () => loja.enviar({ t: 'revelar', obj: o.id, para: 'todos' }) },
        ...v.players.filter((p) => p.id !== eu && !p.left).map((p) => ({ id: `r-${p.id}`, label: `Para ${p.name}`, fazer: () => loja.enviar({ t: 'revelar', obj: o.id, para: [p.id] }) })),
      ] });
    }
    if (!v.gameOver) {
      itens.push(grupoManual);
      if (noCampo) {
        itens.push({ id: 'virar', label: o.tapped ? 'Desvirar' : 'Virar', desativado: !manualOk, fazer: () => manual({ k: 'virar', obj: o.id, tapped: !o.tapped }) });
        itens.push({ tipo: 'sub', id: 'marcadores', label: 'Marcadores', desativado: !manualOk, itens: MARCAS_CARTA.map(([k, nome]) => ({
          tipo: 'contador', id: k, label: nome,
          menos: () => manual({ k: 'marcadores', target: { kind: 'obj', id: o.id }, kind: k, delta: -1 }),
          mais: () => manual({ k: 'marcadores', target: { kind: 'obj', id: o.id }, kind: k, delta: 1 }),
        })) });
      }
      const de = noCampo ? 'battlefield' : naMao ? 'hand' : null;
      itens.push({ tipo: 'sub', id: 'mover', label: 'Mover para…', desativado: !manualOk, itens: DESTINOS.filter(([z]) => z !== de).map(([z, nome]) => ({ id: `m-${z}`, label: nome, fazer: () => manual({ k: 'mover', obj: o.id, to: z }) })) });
      if (noCampo && o.controller === eu && posicoes[o.id]) {
        itens.push({ tipo: 'grupo', id: 'g-mesa', label: 'Mesa' });
        itens.push({ id: 'arrumar', label: 'Voltar à arrumação', fazer: () => { setPosLocal((a) => { const n = { ...a }; delete n[o.id]; return n; }); loja.enviar({ t: 'posicao', obj: o.id, limpar: true }); } });
      }
    }
    abrirMenu(nomeObj(o.id), itens, new DOMRect(ev.clientX, ev.clientY, 0, 0));
  };
  const menuArea = (ev: MouseEvent) => {
    if (pegar || v.gameOver) return;
    setZoom(null);
    const virados = v.battlefield.filter((o) => o.controller === eu && o.tapped);
    const itens: ItemMenu[] = [
      grupoManual,
      { id: 'desvirar', label: 'Desvirar tudo', desativado: !manualOk || !virados.length, fazer: () => setFila(virados.map((o) => ({ k: 'virar', obj: o.id, tapped: false }))) },
      { id: 'ficha', label: 'Criar ficha…', desativado: !manualOk, fazer: () => { setManualTipo('ficha'); setManualAberto(true); } },
      { tipo: 'sub', id: 'marcadores-jogador', label: 'Marcadores de jogador', desativado: !manualOk, itens: MARCAS_JOGADOR.map(([k, nome]) => ({
        tipo: 'contador', id: k, label: nome,
        menos: () => manual({ k: 'marcadores', target: { kind: 'player', id: eu }, kind: k, delta: -1 }),
        mais: () => manual({ k: 'marcadores', target: { kind: 'player', id: eu }, kind: k, delta: 1 }),
      })) },
      { tipo: 'grupo', id: 'g-mesa', label: 'Mesa' },
      { id: 'reorganizar', label: 'Reorganizar meu campo', fazer: () => { setPosLocal({}); loja.enviar({ t: 'posicao', limpar: true }); } },
    ];
    abrirMenu('Seu campo', itens, new DOMRect(ev.clientX, ev.clientY, 0, 0));
  };

  const clicarCarta = (o: ObjView, r: DOMRect) => {
    if (pegar) { pegar.cb(o.id); return; }
    if (!d || enviando) return;
    if (d.kind === 'select') {
      const id = itemPorObj.get(o.id);
      if (id === undefined) return;
      if (sel.includes(id)) setSel(sel.filter((x) => x !== id));
      else if (d.max === 1) setSel([id]);
      else if (sel.length < d.max) setSel([...sel, id]);
      return;
    }
    if (d.kind === 'payment') {
      // virar a fonte na mesa: com uma habilidade só, vira direto; com várias, você escolhe
      const fontes = fontesPorObj.get(o.id);
      if (!fontes?.length) return;
      const ativar = (f: PaymentSource) => loja.responder(d.id, { kind: 'payment', activate: { source: f.id } });
      if (fontes.length === 1) ativar(fontes[0]);
      else abrirMenu(nomeObj(o.id), legais(fontes.map((f) => ({ id: f.id, label: f.label, fazer: () => ativar(f) }))), r);
      return;
    }
    if (d.kind === 'priority') {
      const acoes = acoesPorObj.get(o.id);
      if (!acoes?.length) return;
      // terreno com uma habilidade de mana só: vira e a mana vai para a reserva
      if (acoes.length === 1 && acoes[0].kind === 'mana') { fazerAcao(acoes[0]); return; }
      abrirMenu(nomeObj(o.id), legais(acoes.map((a) => ({ id: a.id, label: a.label, fazer: () => fazerAcao(a) }))), r);
      return;
    }
    if (atacantesCand) {
      const alvos = atacantesCand.get(o.id);
      if (!alvos) return;
      if (ataques[o.id]) { const n = { ...ataques }; delete n[o.id]; setAtaques(n); return; }
      // sem escolha a fazer: um alvo só (ex.: um contra um)
      if (alvos.length === 1) { setAtaques({ ...ataques, [o.id]: alvos[0] }); return; }
      abrirMenu(nomeObj(o.id), alvos.map((t) => ({ id: `${t.kind}${t.id}`, label: `Atacar ${nomeAlvo(t)}`, legal: true, fazer: () => setAtaques({ ...ataques, [o.id]: t }) })), r);
      return;
    }
    if (bloqueadoresCand) {
      if (bloqueadorAtivo !== null && bloqueadoresCand.get(bloqueadorAtivo)?.includes(o.id)) {
        setBloqueios({ ...bloqueios, [bloqueadorAtivo]: o.id });
        setBloqueadorAtivo(null);
        return;
      }
      if (bloqueios[o.id] !== undefined) { const n = { ...bloqueios }; delete n[o.id]; setBloqueios(n); return; }
      if (bloqueadoresCand.get(o.id)?.length) setBloqueadorAtivo(o.id === bloqueadorAtivo ? null : o.id);
    }
  };
  const clicarJogador = (p: number) => {
    if (d?.kind !== 'select') return;
    const id = itemPorJogador.get(p);
    if (id === undefined) return;
    if (sel.includes(id)) setSel(sel.filter((x) => x !== id));
    else if (d.max === 1) setSel([id]);
    else if (sel.length < d.max) setSel([...sel, id]);
  };
  const mostrarZoom = (o: ObjView | null, r?: DOMRect) => setZoom(o && r ? { o, lado: r.left + r.width / 2 < innerWidth / 2 ? 'dir' : 'esq' } : null);

  const anexos = useMemo(() => {
    const m = new Map<ObjId, ObjView[]>();
    const noCampo = new Set(v.battlefield.map((o) => o.id));
    for (const o of v.battlefield) if (o.attachedTo !== null && noCampo.has(o.attachedTo)) m.set(o.attachedTo, [...(m.get(o.attachedTo) ?? []), o]);
    return m;
  }, [v.battlefield]);
  const objsPorJogador = useMemo(() => {
    const noCampo = new Set(v.battlefield.map((o) => o.id));
    const m = new Map<number, ObjView[]>();
    for (const o of v.battlefield) {
      if (o.attachedTo !== null && noCampo.has(o.attachedTo)) continue;
      m.set(o.controller, [...(m.get(o.controller) ?? []), o]);
    }
    return m;
  }, [v.battlefield]);
  const fundoDe = (p: number) => {
    const deck = e.decks.find((x) => x.id === sala.assentos[p]?.deck);
    return deck ? urlArte(deck.comandante) : null;
  };

  const duelo = sala.modo === '1v1';
  const area = (j: PlayerView, compacta: boolean) => {
    const itemJ = itemPorJogador.get(j.id);
    return (
      <AreaJogador
        key={j.id}
        j={j}
        objs={objsPorJogador.get(j.id) ?? []}
        anexos={anexos}
        comandantes={v.command.filter((o) => o.owner === j.id)}
        exilio={v.exile.filter((o) => o.owner === j.id)}
        eu={j.id === eu}
        ativo={v.turn.active === j.id}
        decidindo={v.waiting?.player === j.id}
        compacta={compacta}
        duelo={duelo}
        cor={cor(j.id)}
        fundo={fundoDe(j.id)}
        realce={realce}
        legenda={legenda}
        onCarta={clicarCarta}
        onZoom={mostrarZoom}
        jogadorRealce={itemJ === undefined ? null : sel.includes(itemJ) ? 'escolhido' : 'escolhivel'}
        onJogador={itemJ !== undefined ? () => clicarJogador(j.id) : undefined}
        onZona={(zona) => setModal({ tipo: 'zona', jogador: j.id, zona })}
        mao={j.id === eu ? v.hand : undefined}
        reservaDireita={j.id === eu ? 336 : 0}
        posicoes={posicoes}
        arrastando={arrastando}
        onPegarCampo={j.id === eu && !v.gameOver ? pegarCampo : undefined}
        onPegarMao={j.id === eu ? pegarMao : undefined}
        onDuploMao={j.id === eu ? jogar : undefined}
        onMenuCarta={menuCarta}
        onMenuArea={j.id === eu ? menuArea : undefined}
      />
    );
  };

  const oponentes = ordem.slice(1).map((p) => v.players[p]);
  const minha = v.players[eu];
  const logRef = useRef<HTMLOListElement>(null);
  useEffect(() => { const el = logRef.current; if (el) el.scrollTop = el.scrollHeight; }, [v.log.length, registroAberto, recolhida]);
  const decisaoManual = d?.kind === 'priority' && d.actions.some((a) => a.kind === 'manual') ? d.id : null;
  // sem prioridade, o ajuste manual fecha (antes ele sumia e voltava sozinho na prioridade seguinte)
  useEffect(() => { if (decisaoManual === null) { setManualAberto(false); setManualTipo(undefined); setPegar(null); } }, [decisaoManual]);
  const preJogo = v.turn.number === 0 && !v.gameOver;
  const mostrarDecisao = d && !v.gameOver && !enviando && !preJogo && (d.kind !== 'priority' || acoesSoltas.length > 0);

  return (<>
    <div class={`mesa ${duelo ? 'mesa-duelo' : ''} ${recolhida ? 'recolhida' : ''}`} onClick={() => setMenu(null)}>
      <main class="tabuleiro" onContextMenu={(ev) => ev.preventDefault()}>
        <div class={`oponentes n${oponentes.length}`}>{oponentes.map((j) => area(j, true))}</div>
        {area(minha, false)}
        <FaixaFases v={v} eu={eu} d={d} enviando={enviando} paradas={e.paradas} cor={cor} />

        <div class="coluna-dir">
          <Avisos v={v} cor={cor} />
          {v.gameOver && (
            <div class="cartao fim">
              <p class="decisao-titulo">Fim de partida</p>
              <p>{v.gameOver.draw ? 'Empate.' : `Venceu: ${v.gameOver.winners.map((w) => v.players[w].name).join(', ')}.`}</p>
              {sala.anfitriao === eu && <button class="botao principal" onClick={() => loja.enviar({ t: 'novaPartida' })}>Nova partida com a mesma mesa</button>}
            </div>
          )}
          {v.stack.length > 0 && (
            <section class="cartao pilha" aria-label="Pilha">
              <div class="pilha-cab"><span class="rot">Pilha</span><span class="rot">{v.stack.length}</span></div>
              <ol>
                {v.stack.map((s, i) => {
                  const img = s.def ? urlImagem(s.def, 0, 'p') : null;
                  return (
                    <li key={s.id} class={`${i === 0 ? 'topo' : ''} ${img ? '' : 'sem-imagem'}`} style={{ '--cor': cor(s.controller) }}>
                      {img && <img src={img} alt="" class="mini" />}
                      <div>
                        <strong>{s.def ? nomeCarta(s.def, s.name) : s.name}</strong>
                        <span><span class="quem">{v.players[s.controller].name}</span><span class="suave">{s.kind !== 'spell' ? (s.kind === 'triggered' ? ' · gatilho' : ' · habilidade') : ''}</span></span>
                        {s.text && <p class="pilha-texto"><TextoComSimbolos texto={traduzir(s.text)} /></p>}
                        {s.targets.length > 0 && <p class="pilha-texto">Alvos: {traduzir(s.targets.join(', '))}</p>}
                        {s.x > 0 && <p class="pilha-texto">X = {s.x}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
          {d && mostrarDecisao && (
            <div class="cartao">
              <p class="rot">{rotuloDecisao(d)}</p>
              <Decisao v={v} d={d} ui={ui} nomeObj={nomeObj} nomeAlvo={nomeAlvo} visivel={(id) => todos.has(id)} acoesSoltas={acoesSoltas} reserva={minhaReserva} />
            </div>
          )}
        </div>

        {e.reveladas.length > 0 && (
          <div class="reveladas" aria-live="polite">
            {e.reveladas.map((r) => {
              const img = urlImagem(r.def, 0, 'm');
              const para = r.para === 'todos' ? 'todos' : r.para.map((p) => v.players[p]?.name).join(', ');
              return (
                <div key={r.id} class="revelada" style={{ '--cor': cor(r.de) }}>
                  <p>{r.de === eu ? <>Você mostrou para <b>{para}</b></> : <><b>{v.players[r.de]?.name}</b> mostrou{r.para === 'todos' ? '' : ' para você'}</>}</p>
                  {img ? <img src={img} alt={nomeCarta(r.def, r.def)} /> : <strong>{nomeCarta(r.def, r.def)}</strong>}
                </div>
              );
            })}
          </div>
        )}
        {preJogo && <MaoInicial v={v} d={d} enviando={enviando} regra={sala.mulligan ?? 'londres'} multiplayer={sala.modo === '4p'} sel={sel} setSel={setSel} />}
      </main>

      <aside class="lateral" aria-label="Menu da partida">
        <div class="marca-jogo"><Marca /><span>COMMANDER DA MESA</span></div>
        <div class="lateral-turno" style={{ '--cor': cor(v.turn.active) }}>
          <span class="rot">Turno</span><strong>{v.turn.number || '–'}</strong>
          <span class="vez">{v.turn.number ? <>vez de <span>{v.players[v.turn.active].name}</span></> : 'antes do 1º turno'}</span>
        </div>
        <ul class="menu-lateral">
          <li><button class={registroAberto && !recolhida ? 'ativo' : ''} title="Registro" aria-label="Registro" onClick={() => { if (recolhida) { recolher(false); setRegistroAberto(true); } else setRegistroAberto(!registroAberto); }}><IconeRegistro /><span class="rotulo">Registro</span></button></li>
          <li><button title="Paradas" aria-label="Paradas" onClick={() => setModal({ tipo: 'paradas' })}><IconeParadas /><span class="rotulo">Paradas</span></button></li>
          <li><button title="Ajuste manual" aria-label="Ajuste manual" disabled={decisaoManual === null} onClick={() => setManualAberto(true)}><IconeAjuste /><span class="rotulo">Ajuste manual</span></button></li>
          <li><button title="Configurações" aria-label="Configurações" onClick={() => setModal({ tipo: 'config' })}><IconeConfig /><span class="rotulo">Configurações</span></button></li>
          {!v.gameOver && !minha.left && <li><button title="Conceder" aria-label="Conceder" onClick={() => setModal({ tipo: 'conceder' })}><IconeConceder /><span class="rotulo">Conceder</span></button></li>}
          <li><button title="Sair" aria-label="Sair" onClick={() => loja.enviar({ t: 'sair' })}><IconeSair /><span class="rotulo">Sair</span></button></li>
          <li><button class="recolher" title={recolhida ? 'Abrir a barra' : 'Recolher a barra'} aria-label={recolhida ? 'Abrir a barra' : 'Recolher a barra'} onClick={() => recolher(!recolhida)}><IconeRecolher /><span class="rotulo">Recolher</span></button></li>
        </ul>
        <section class={`registro ${registroAberto ? '' : 'escondido'}`} aria-label="Registro da partida">
          <h2>Registro</h2>
          <ol ref={logRef}>
            {v.log.map((l, i) => <li key={i} class={l.text.includes('(ajuste manual)') ? 'manual' : ''}><span class="registro-turno">{l.turn}</span> {traduzir(l.text)}{l.rule ? <span class="regra"> (CR {l.rule})</span> : null}</li>)}
          </ol>
        </section>
      </aside>
    </div>

    {/* camadas por cima da mesa ficam fora da grade dela (dentro, viravam linhas novas e cortavam o tabuleiro) */}
    <CamadaArrasto />
    {/* o zoom fica acima das janelas (ex.: ler uma carta do cemitério com a janela aberta) */}
    {zoom && !arrastando && <div class={`camada-zoom ${recolhida ? 'recolhida' : ''}`}><Zoom o={zoom.o} lado={zoom.lado} /></div>}
    {menu && <MenuFlutuante menu={menu} fechar={() => setMenu(null)} />}

    {pegar && (
      <div class="faixa-pegar">
        <span>{pegar.prompt}</span>
        <button class="botao pequeno" onClick={() => { setPegar(null); }}>Cancelar</button>
      </div>
    )}

    {modal?.tipo === 'zona' && (() => {
      const j = v.players[modal.jogador];
      const cartas = modal.zona === 'graveyard' ? j.graveyard : v.exile.filter((o) => o.owner === j.id);
      return (
        <Janela titulo={`${modal.zona === 'graveyard' ? 'Cemitério' : 'Exílio'} de ${j.name} (${cartas.length})`} larga fechar={() => setModal(null)}>
          <div class="grade-cartas">
            {cartas.length === 0 && <p class="suave">Vazio.</p>}
            {[...cartas].reverse().map((o) => <Carta key={o.id} o={o} realce={realce(o)} onZoom={mostrarZoom} onClick={(x, r) => { clicarCarta(x, r); if (pegar || d?.kind === 'priority') setModal(null); }} />)}
          </div>
        </Janela>
      );
    })()}

    {modal?.tipo === 'paradas' && e.paradas && <Paradas atual={e.paradas} fechar={() => setModal(null)} />}

    {modal?.tipo === 'carta' && (
      <Janela titulo={nomeObj(modal.o.id)} classe="carta-info" fechar={() => setModal(null)}>
        <Zoom o={modal.o} fixo />
      </Janela>
    )}

    {modal?.tipo === 'config' && (
      <Janela titulo="Configurações" fechar={() => setModal(null)}>
        <label class="caixa"><input type="checkbox" checked={pref.pagarAuto} onChange={() => mudarPreferencias({ pagarAuto: !pref.pagarAuto })} /> Pagar automaticamente por padrão</label>
        <p class="suave">Desligado, você paga clicando nos seus terrenos. Ligado, o jogo escolhe as fontes sozinho sempre que der. Vale só neste navegador.</p>
        <div class="linha-config">
          <div><strong>Arrumação do campo</strong><p class="suave">Volta todas as suas permanentes para a arrumação padrão.</p></div>
          <button class="botao" onClick={() => { setPosLocal({}); loja.enviar({ t: 'posicao', limpar: true }); setModal(null); }}>Reorganizar meu campo</button>
        </div>
      </Janela>
    )}

    {modal?.tipo === 'conceder' && (
      <Janela titulo="Conceder a partida?" fechar={() => setModal(null)}>
        <p class="suave">Você sai da partida e os outros continuam (CR 104.3a, 800.4a).</p>
        <div class="botoes-linha">
          <button class="botao perigo" onClick={() => { loja.enviar({ t: 'conceder' }); setModal(null); }}>Conceder</button>
          <button class="botao" onClick={() => setModal(null)}>Voltar</button>
        </div>
      </Janela>
    )}

    {manualAberto && decisaoManual !== null && (
      <Manual v={v} decisao={decisaoManual} tipoInicial={manualTipo} escondida={!!pegar} fechar={() => { setManualAberto(false); setManualTipo(undefined); setPegar(null); }} pegar={setPegar} nomeObj={nomeObj} />
    )}
  </>);
}
