// Estado: criação da partida, objetos, zonas e primitivas de mudança de zona.
// As ações com efeitos de substituição e gatilhos ficam em actions.ts.

import { chars } from './chars.ts';
import type { G } from './game-context.ts';
import { seedFrom, shuffle } from './rng.ts';
import type {
  CardId, Chars, ContinuousEffect, GameConfig, GameObject, GameState, ObjId, PlayerId, PlayerState, TurnStats, ZoneName,
} from './types.ts';

export const ENGINE_VERSION = 1;

export interface DeckList {
  id: string;
  nome: string;
  comandante: string;
  cartas: { nome: string; quantidade: number }[];
}

export function emptyTurnStats(): TurnStats {
  return {
    lifeGained: 0, lifeLost: 0, spellsCast: 0, noncreatureSpellsCast: 0, instantSorceryCast: 0, greatestInstantSorceryMV: 0,
    cardsDrawn: 0, cardsLeftGraveyard: 0, attacked: false, attackedPlayers: [], countersPutOnCreatures: 0,
    creaturesDied: 0, permanentsToGraveyard: 0, toGraveyardNotFromBattlefield: [], sacrificedCreature: false,
  };
}

export function blankObject(id: ObjId, partial: Partial<GameObject> & Pick<GameObject, 'def' | 'owner' | 'zone'>): GameObject {
  return {
    id,
    card: null,
    controller: partial.owner,
    timestamp: 0,
    face: 0,
    tapped: false,
    faceDown: false,
    phasedOut: false,
    counters: {},
    damage: 0,
    deathtouched: false,
    attachedTo: null,
    controlledSince: 0,
    isToken: false,
    copyOf: null,
    isCopy: false,
    choices: {},
    linked: {},
    prepared: false,
    classLevel: 1,
    goadedBy: [],
    visibleTo: null,
    usedThisTurn: {},
    stack: null,
    data: {},
    ...partial,
  };
}

/**
 * Cria a partida (CR 103): assentos aleatórios (CR 806.3), comandante na zona de comando
 * (CR 903.6), grimórios embaralhados (CR 103.3), vida inicial (CR 103.4c / 903.7).
 * O jogador inicial é sorteado (CR 103.1).
 */
export function createGameState(config: GameConfig, decks: DeckList[]): GameState {
  if (decks.length !== config.players.length) throw new Error('Um deck por jogador');
  const rng = seedFrom(config.seed);
  const n = config.players.length;
  const seats = shuffle(rng, Array.from({ length: n }, (_, i) => i));
  const players: PlayerState[] = config.players.map((p, i) => ({
    id: i, name: p.name, deckId: p.deckId, life: config.startingLife, counters: {}, manaPool: [],
    left: false, lost: false, won: false, conceded: false, drewFromEmpty: false,
    commanders: [], commanderCasts: {}, commanderDamage: {}, mulligans: 0, kept: false, citysBlessing: false, lastTurn: -1,
  }));
  const state: GameState = {
    engineVersion: ENGINE_VERSION,
    version: 0,
    config,
    rng,
    players,
    turnOrder: seats,
    turn: { number: 0, active: seats[0], step: 'untap', queue: [], stepBegun: false, mainPhaseCount: 0, combatCount: 0, landsPlayed: 0 },
    priority: null,
    passesInRow: 0,
    objects: {},
    cards: {},
    zones: {
      library: players.map(() => []), hand: players.map(() => []), graveyard: players.map(() => []),
      battlefield: [], stack: [], exile: [], command: [],
    },
    nextId: 1,
    nextTimestamp: 1,
    effects: [],
    pendingTriggers: [],
    delayedTriggers: [],
    triggerSeq: 0,
    combat: null,
    turnStats: players.map(() => emptyTurnStats()),
    lastTurnAttackedPlayers: players.map(() => []),
    lki: {},
    monarch: null,
    log: [],
    gameOver: null,
    decisionSeq: 0,
    turnCounters: {},
    started: false,
    commanderOffered: [],
  };
  let nextCard = 1;
  decks.forEach((deck, p) => {
    const add = (name: string, isCommander: boolean): void => {
      const cid: CardId = nextCard++;
      state.cards[cid] = { id: cid, def: name, owner: p, isCommander };
      const id = state.nextId++;
      const zone: ZoneName = isCommander ? 'command' : 'library';
      state.objects[id] = blankObject(id, { def: name, owner: p, zone, card: cid, timestamp: state.nextTimestamp++ });
      if (isCommander) { state.zones.command.push(id); players[p].commanders.push(cid); }
      else state.zones.library[p].push(id);
    };
    add(deck.comandante, true);
    for (const e of deck.cartas) for (let i = 0; i < e.quantidade; i++) add(e.nome, false);
    shuffle(rng, state.zones.library[p]);
  });
  return state;
}

// ---------------------------------------------------------------------------
// Zonas
// ---------------------------------------------------------------------------
export function zoneList(g: G, o: { zone: ZoneName; owner: PlayerId }): ObjId[] {
  return g.zoneOf(o.owner, o.zone);
}

export function removeFromZone(g: G, o: GameObject): void {
  const list = zoneList(g, o);
  const i = list.indexOf(o.id);
  if (i >= 0) list.splice(i, 1);
}

export type Position = 'top' | 'bottom' | number;

/** grimório: índice 0 é o topo. Cemitério e pilha: o fim da lista é o topo. */
export function addToZone(g: G, o: GameObject, position: Position = 'top'): void {
  const list = zoneList(g, o);
  if (o.zone === 'library') {
    if (position === 'top') list.unshift(o.id);
    else if (position === 'bottom') list.push(o.id);
    else list.splice(Math.min(position, list.length), 0, o.id);
  } else list.push(o.id);
}

export function newTimestamp(g: G): number {
  return g.state.nextTimestamp++;
}

export function newObjectId(g: G): ObjId {
  return g.state.nextId++;
}

/** guarda a última informação conhecida do objeto antes de ele mudar de zona (CR 608.2h) */
export function recordLki(g: G, id: ObjId, newId: ObjId | null, newZone: ZoneName | null): void {
  const o = g.state.objects[id];
  if (!o) return;
  let c: Chars;
  try { c = structuredClone(chars(g, id)); } catch { c = { name: o.def, manaCost: null, manaValue: 0, colors: [], supertypes: [], types: [], subtypes: [], abilities: [], power: null, toughness: null, loyalty: null, controller: o.controller }; }
  g.state.lki[id] = { obj: structuredClone(o), chars: c, turn: g.state.turn.number, newId, newZone };
}

export interface MoveOptions {
  position?: Position;
  controller?: PlayerId;
  tapped?: boolean;
  faceDown?: boolean;
  face?: number;
  counters?: Record<string, number>;
  attachTo?: ObjId | null;
  keepCopy?: boolean;
  visibleTo?: GameObject['visibleTo'];
}

/**
 * Move um objeto para outra zona sem aplicar substituições: cria um objeto novo (CR 400.7)
 * e guarda a última informação conhecida do antigo. Devolve o id novo.
 * CR 400.3: cartas vão para a zona do dono (grimório, mão, cemitério).
 */
export function moveRaw(g: G, id: ObjId, to: ZoneName, opts: MoveOptions = {}): ObjId {
  const s = g.state;
  const o = g.obj(id);
  const newId = newObjectId(g);
  recordLki(g, id, newId, to);
  removeFromZone(g, o);
  const controller = to === 'battlefield' || to === 'stack' ? (opts.controller ?? o.owner) : o.owner;
  const n = {
    ...structuredClone(o),
    id: newId,
    zone: to,
    controller,
    timestamp: newTimestamp(g),
    tapped: to === 'battlefield' ? !!opts.tapped : false,
    faceDown: !!opts.faceDown,
    phasedOut: false,
    counters: opts.counters ? { ...opts.counters } : {},
    damage: 0,
    deathtouched: false,
    attachedTo: to === 'battlefield' ? (opts.attachTo ?? null) : null,
    controlledSince: s.turn.number,
    // cópias de mágica/carta que saem da pilha deixam de existir pela ação de estado (CR 704.5e)
    copyOf: opts.keepCopy || o.isCopy ? o.copyOf : null,
    choices: {},
    linked: to === o.zone ? o.linked : {},
    prepared: false,
    classLevel: 1,
    goadedBy: [],
    visibleTo: opts.visibleTo ?? null,
    usedThisTurn: {},
    stack: null,
    data: {},
    face: opts.face ?? 0,
  } satisfies GameObject;
  // fichas que saem do campo continuam como fichas até a ação de estado (CR 111.7-111.8)
  delete s.objects[id];
  s.objects[newId] = n;
  addToZone(g, n, opts.position ?? 'top');
  // Auras e Equipamentos presos a este objeto continuam apontando para o id antigo;
  // as ações de estado os põem no cemitério ou os desanexam (CR 704.5m, 704.5n).
  endEffectsTiedTo(g, id);
  g.bump();
  return newId;
}

/** efeitos "enquanto X estiver no campo" terminam quando X sai (CR 611.2b) */
export function endEffectsTiedTo(g: G, id: ObjId): void {
  const before = g.state.effects.length;
  g.state.effects = g.state.effects.filter((e) => {
    if (e.duration.kind === 'whileOnBattlefield' && e.duration.obj === id) return false;
    if (e.duration.kind === 'whileControlled' && e.duration.obj === id) return false;
    return true;
  });
  // efeitos que afetam objetos que deixaram de existir são inofensivos, mas limpamos os vazios
  for (const e of g.state.effects) if (e.affected && e.affected.includes(id)) e.affected = e.affected.filter((x) => x !== id);
  g.state.effects = g.state.effects.filter((e) => !e.affected || e.affected.length > 0 || e.mods.some((m) => m.k === 'rule'));
  if (g.state.effects.length !== before) g.bump();
}

/** cria um objeto novo numa zona (fichas, cópias, habilidades na pilha) */
export function createObject(g: G, partial: Partial<GameObject> & Pick<GameObject, 'def' | 'owner' | 'zone'>, position: Position = 'top'): GameObject {
  const id = newObjectId(g);
  const o = blankObject(id, { timestamp: newTimestamp(g), controlledSince: g.state.turn.number, ...partial });
  g.state.objects[id] = o;
  addToZone(g, o, position);
  g.bump();
  return o;
}

/** remove o objeto do jogo (ficha que deixa de existir, CR 704.5d; habilidade que sai da pilha) */
export function destroyObject(g: G, id: ObjId): void {
  const o = g.state.objects[id];
  if (!o) return;
  recordLki(g, id, null, null);
  removeFromZone(g, o);
  delete g.state.objects[id];
  endEffectsTiedTo(g, id);
  g.bump();
}

export function addEffect(g: G, e: Omit<ContinuousEffect, 'id' | 'timestamp'> & { timestamp?: number }): ContinuousEffect {
  const eff: ContinuousEffect = { id: g.state.nextId++, timestamp: e.timestamp ?? newTimestamp(g), ...e };
  g.state.effects.push(eff);
  g.bump();
  return eff;
}

export function removeEffect(g: G, id: number): void {
  g.state.effects = g.state.effects.filter((e) => e.id !== id);
  g.bump();
}

export function setCounters(g: G, o: GameObject, kind: string, n: number): void {
  if (n <= 0) delete o.counters[kind];
  else o.counters[kind] = n;
  g.bump();
}

/** objeto pelo id, ou a última informação conhecida dele (CR 608.2h) */
export function objOrLki(g: G, id: ObjId): GameObject | null {
  return g.state.objects[id] ?? g.state.lki[id]?.obj ?? null;
}

/** segue a cadeia de LKI até o objeto em que ele se tornou (CR 400.7e: "a nova carta") */
export function successor(g: G, id: ObjId): ObjId | null {
  const l = g.state.lki[id];
  return l?.newId ?? null;
}
