// O mundo do bot: uma cópia da partida em que tudo o que o jogador daquele assento não vê foi sorteado de novo
// (fase 9, item 1.5). Nenhum bot decide olhando a partida verdadeira: decide numa cópia destas.
//
// O que fica escondido de `eu` (CR 401.2, 402.3, 708): a mão dos outros, a ordem e o conteúdo dos grimórios (o dele
// também) e as cartas viradas para baixo que ele não pode olhar. O conjunto dessas cartas é a lista do deck (conhecida
// na mesa) menos o que já apareceu; o sorteio parte desse conjunto numa ordem canônica (pelo número da carta), então
// trocar quais cartas estão na mão e quais estão no grimório não muda nada do que o bot vê nem do que ele decide.
// A última informação conhecida (LKI) de cartas que andaram entre zonas escondidas e o registro com detalhes ocultos
// também saem da cópia.

import { controllerOf } from '../motor/chars.ts';
import { Game, type Checkpoint, type Input } from '../motor/game.ts';
import { G } from '../motor/game-context.ts';
import { oracle } from '../motor/oracle.ts';
import { int, next, seedFrom, shuffle, type RngState } from '../motor/rng.ts';
import type { DeckList } from '../motor/state.ts';
import type { Decision, GameObject, GameState, ObjId, PlayerId } from '../motor/types.ts';

/** para os testes: recebe cada mundo montado (o teste do item 1.5 confere que são iguais com o escondido trocado) */
export const auditoria: { mundo: ((s: GameState) => void) | null } = { mundo: null };

/** o que um jogador atento sabe além do que está à vista (Cartomante): ver bots/memoria.ts */
export interface InfoOculta {
  /** por jogador: cartas (pelo nome) que se sabe estarem na mão (reveladas, devolvidas do campo…) */
  naMao?: Record<number, string[]>;
  /** por jogador: provavelmente sem terreno entre as cartas que já estavam na mão antes deste número de objeto */
  semTerreno?: Record<number, number>;
  /** por jogador: provavelmente com uma mágica de instante entre as cartas que já estavam na mão antes deste número */
  truque?: Record<number, number>;
}

const PUBLICAS = new Set(['battlefield', 'graveyard', 'exile', 'stack', 'command']);

function vistoPor(g: G, o: GameObject, eu: PlayerId): boolean {
  const lista = (v: GameObject['visibleTo']) => v === 'all' || (Array.isArray(v) && v.includes(eu));
  if (o.zone === 'library') return lista(o.visibleTo);
  if (o.zone === 'hand') return o.owner === eu || lista(o.visibleTo);
  if (o.faceDown) {
    if (o.zone === 'battlefield' || o.zone === 'stack') return controllerOf(g, o.id) === eu || lista(o.visibleTo);
    return lista(o.visibleTo);
  }
  return true;
}

/** objetos citados na decisão: quem decide está vendo (ex.: as cartas de uma busca no próprio grimório) */
export function citados(d: Decision | null): Set<ObjId> {
  const s = new Set<ObjId>();
  if (!d) return s;
  const num = (x: unknown) => { const n = Number(x); if (Number.isInteger(n) && n > 0) s.add(n); };
  switch (d.kind) {
    case 'select': case 'arrange': for (const it of d.items) { if (it.obj !== undefined) s.add(it.obj); else num(it.id); } break;
    case 'priority': for (const a of d.actions) if (a.obj !== undefined) s.add(a.obj); break;
    default: break;
  }
  return s;
}

const tipos = (def: string): string[] => { try { return oracle(def).faces[0]?.types ?? []; } catch { return []; } };
const ehTerreno = (def: string) => tipos(def).includes('Land');
const ehTruque = (def: string) => {
  try { const o = oracle(def); return o.faces[0]?.types.includes('Instant') || o.keywords.includes('Flash'); } catch { return false; }
};

/**
 * Sorteia de novo, no lugar, tudo o que `eu` não vê em `g` (uma cópia: nunca a partida verdadeira).
 * `fixos`: objetos que a decisão mostra a `eu` (ficam como estão).
 */
export function ocultar(g: G, eu: PlayerId, rng: RngState, info: InfoOculta = {}, fixos: Set<ObjId> = new Set()): void {
  const s = g.state;
  const escondido = (o: GameObject | undefined): o is GameObject => !!o && o.card !== null && !o.isToken && !fixos.has(o.id) && !vistoPor(g, o, eu);
  for (const p of s.players) {
    // os lugares (objetos) escondidos deste dono, numa ordem que não depende do conteúdo
    const mao = p.id === eu ? [] : s.zones.hand[p.id].filter((id) => escondido(s.objects[id]));
    const grimorio = s.zones.library[p.id].filter((id) => escondido(s.objects[id]));
    const virados = [...s.zones.battlefield, ...s.zones.stack, ...s.zones.exile]
      .filter((id) => { const o = s.objects[id]; return o?.faceDown && o.owner === p.id && escondido(o); })
      .sort((a, b) => a - b);
    const lugares = [...mao, ...grimorio, ...virados];
    if (!lugares.length) continue;
    // o conteúdo: em ordem canônica (número da carta), depois embaralhado com o sorteio do bot
    const monte = shuffle(rng, lugares.map((id) => ({ def: s.objects[id].def, card: s.objects[id].card })).sort((a, b) => a.card! - b.card!));
    const tirar = (f: (c: { def: string }) => boolean): { def: string; card: number | null } | null => {
      const i = monte.findIndex(f);
      return i < 0 ? null : monte.splice(i, 1)[0];
    };
    const naMao = new Map<ObjId, { def: string; card: number | null }>();
    // cartas sabidas na mão (Cartomante): ocupam os primeiros lugares da mão
    let k = 0;
    for (const nome of info.naMao?.[p.id] ?? []) {
      if (k >= mao.length) break;
      const c = tirar((x) => x.def === nome);
      if (c) naMao.set(mao[k++], c);
    }
    // leitura da mesa: as cartas que já estavam na mão (antes do limite) provavelmente não são terrenos / têm um truque
    const livres = mao.slice(k);
    const limTruque = info.truque?.[p.id] ?? 0;
    const limTerreno = info.semTerreno?.[p.id] ?? 0;
    if (limTruque && next(rng) < 0.65) {
      const id = livres.find((x) => x < limTruque);
      const c = id !== undefined ? tirar((x) => ehTruque(x.def)) : null;
      if (c) { naMao.set(id!, c); livres.splice(livres.indexOf(id!), 1); }
    }
    if (limTerreno && next(rng) < 0.85) {
      for (const id of livres.filter((x) => x < limTerreno)) {
        const c = tirar((x) => !ehTerreno(x.def));
        if (!c) break;
        naMao.set(id, c);
      }
    }
    for (const id of lugares) {
      const c = naMao.get(id) ?? monte.shift()!;
      const o = s.objects[id];
      o.def = c.def;
      o.card = c.card;
      o.face = 0;
      o.copyOf = null;
    }
  }
  // última informação conhecida de cartas que andaram por zonas escondidas: o nome nunca apareceu para `eu`
  const lki: GameState['lki'] = {};
  for (const [k, v] of Object.entries(s.lki)) {
    const de = v.obj;
    const origemOculta = de.zone === 'library' || (de.zone === 'hand' && de.owner !== eu) || (de.faceDown && de.controller !== eu);
    const novo = v.newId !== null ? s.objects[v.newId] : undefined;
    const destinoPublico = v.newZone !== null && PUBLICAS.has(v.newZone) && !novo?.faceDown;
    if (origemOculta && !destinoPublico) continue;
    lki[Number(k)] = v;
  }
  s.lki = lki;
  s.log = s.log.filter((e) => e.visibleTo === null || e.visibleTo.includes(eu));
  // o futuro aleatório da partida também é desconhecido
  s.rng = seedFrom(`mundo:${rng.join(':')}`);
  g.bump();
  auditoria.mundo?.(s);
}

/** LKI antiga só pesa na cópia: fica a recente e a que algo ainda referencia */
function lkiRecente(s: GameState): GameState['lki'] {
  const manter = new Set<number>();
  for (const d of s.delayedTriggers) manter.add(d.source);
  for (const p of s.pendingTriggers) manter.add(p.source);
  for (const e of s.effects) manter.add(e.source);
  for (const id of s.zones.stack) { const st = s.objects[id]?.stack; if (st?.source !== undefined) manter.add(st.source); }
  const recente: GameState['lki'] = {};
  for (const [k, v] of Object.entries(s.lki)) if (v.turn >= s.turn.number - 1 || manter.has(Number(k))) recente[Number(k)] = v;
  return recente;
}

/** cópia da partida numa decisão de prioridade, com o que `eu` não vê sorteado de novo */
export function determinizar(game: Game, eu: PlayerId, rng: RngState, info?: InfoOculta): Game {
  const s = game.state;
  const log = s.log;
  const lki = s.lki;
  s.log = [];
  s.lki = lkiRecente(s);
  let f: Game;
  try { f = game.fork(); } finally { s.log = log; s.lki = lki; }
  ocultar(f.g, eu, rng, info, citados(game.pending));
  return f;
}

/** só o estado (sem a partida em andamento), para as heurísticas numa decisão que não é de prioridade */
export function estadoOculto(game: Game, eu: PlayerId, rng: RngState, info?: InfoOculta): G {
  const s = game.state;
  const log = s.log;
  const lki = s.lki;
  s.log = [];
  s.lki = lkiRecente(s);
  let st: GameState;
  try { st = structuredClone(s); } finally { s.log = log; s.lki = lki; }
  const g = new G(st);
  ocultar(g, eu, rng, info, citados(game.pending));
  return g;
}

/**
 * Como refazer a partida até a decisão atual a partir de um checkpoint (o mais recente numa decisão de prioridade) e
 * das entradas seguintes. É o que dá uma cópia jogável também numa decisão de alvos, ataque ou bloqueio.
 */
export interface Refazer {
  cp: Checkpoint;
  decks: DeckList[];
  /** entradas depois do checkpoint */
  entradas: Input[];
}

/** a partida refeita até a decisão atual, já com o que `eu` não vê sorteado de novo (null se não deu para refazer) */
export function refazer(r: Refazer, eu: PlayerId, rng: RngState, info?: InfoOculta): Game | null {
  let game: Game;
  try {
    const st = r.cp.state;
    const log = st.log;
    const lki = st.lki;
    st.log = [];
    st.lki = lkiRecente(st);
    try { game = Game.fromCheckpoint({ state: st, inputIndex: 0 }, r.decks, r.entradas); } finally { st.log = log; st.lki = lki; }
  } catch {
    return null;
  }
  if (!game.pending) return null;
  ocultar(game.g, eu, rng, info, citados(game.pending));
  return game;
}

/**
 * Cópias jogáveis da decisão atual. Refaz a partida uma vez até a última decisão de prioridade (as entradas guardam o
 * tipo da resposta), guarda o estado ali e, a cada cópia, refaz só as poucas entradas seguintes.
 */
export class Copiador {
  readonly cp: Checkpoint;
  readonly resto: Input[];
  readonly decks: DeckList[];
  constructor(r: Refazer) {
    this.decks = r.decks;
    let j = -1;
    for (let i = r.entradas.length - 1; i >= 0; i--) { const e = r.entradas[i]; if (e.t === 'a' && e.a.kind === 'priority') { j = i; break; } }
    let cp = r.cp;
    let resto = r.entradas;
    if (j > 0) {
      try {
        const game = Game.fromCheckpoint({ state: r.cp.state, inputIndex: 0 }, r.decks, r.entradas.slice(0, j));
        const c = game.checkpoint();
        if (c) { cp = { state: c.state, inputIndex: r.cp.inputIndex + j }; resto = r.entradas.slice(j); }
      } catch { /* fica com o checkpoint de antes */ }
    }
    this.cp = cp;
    this.resto = resto;
  }

  copia(eu: PlayerId, rng: RngState, info?: InfoOculta): Game | null {
    return refazer({ cp: this.cp, decks: this.decks, entradas: this.resto }, eu, rng, info);
  }
}

/**
 * Guarda, numa partida jogada no mesmo processo (testes, baterias), o checkpoint do começo do turno e o da última
 * decisão de prioridade, para os bots refazerem a partida numa decisão que não é de prioridade.
 */
export class Rastro {
  private turno: Checkpoint | null = null;
  private turnoN = -1;

  /** chame com a partida antes de cada resposta */
  observar(game: Game): void {
    if (game.pending?.kind !== 'priority') return;
    if (game.state.turn.number === this.turnoN && this.turno) return;
    const cp = game.checkpoint();
    if (cp) { this.turno = cp; this.turnoN = game.state.turn.number; }
  }

  /** como refazer a decisão atual; null se não há checkpoint ainda */
  refazer(game: Game): Refazer | null {
    if (!this.turno || this.turno.inputIndex > game.inputs.length) return null;
    return { cp: this.turno, decks: game.decks, entradas: game.inputs.slice(this.turno.inputIndex) };
  }
}

/** sorteio independente para cada cópia (o bot guarda o próprio estado do sorteio) */
export function ramo(rng: RngState, rotulo: string): RngState {
  return seedFrom(`${rotulo}:${rng.join(':')}:${int(rng, 1e9)}`);
}
