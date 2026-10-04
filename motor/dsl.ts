// Linguagem de efeitos: construtores usados nas definições de cartas.
// Cada construtor devolve um objeto novo (o registro atribui ids por carta).

import { attach, controlledBy, draw, moveObjects, searchLibrary, shuffleLibrary, putOntoBattlefield } from './actions.ts';
import { chars, controllerOf, hasKw, isCreature, isLand, isType, manaValue, nameOf, power, toughness } from './chars.ts';
import type {
  ActivatedDef, CostPart, Ctx, EffectFn, Gen, ManaAbilityDef, ReplacementDef, SCtx, StaticDef, TargetSpec, TriggerCtx,
  TriggeredDef, TriggerSpec, AltCastDef, AdditionalCostDef, ModeSpec, EnterEvent,
} from './defs.ts';
import type { GameEvent } from './events.ts';
import type { G } from './game-context.ts';
import type { Chars, Color, GameObject, ManaType, ObjId, PlayerId, Step, TargetRef, ZoneName } from './types.ts';

export * from './defs.ts';

// ---------------------------------------------------------------------------
// Predicados sobre objetos
// ---------------------------------------------------------------------------
export type Pred = (c: SCtx, id: ObjId) => boolean;

export const is = {
  creature: ((c, id) => isCreature(c.g, id)) as Pred,
  land: ((c, id) => isLand(c.g, id)) as Pred,
  nonland: ((c, id) => !isLand(c.g, id)) as Pred,
  artifact: ((c, id) => isType(c.g, id, 'Artifact')) as Pred,
  enchantment: ((c, id) => isType(c.g, id, 'Enchantment')) as Pred,
  planeswalker: ((c, id) => isType(c.g, id, 'Planeswalker')) as Pred,
  instantOrSorcery: ((c, id) => isType(c.g, id, 'Instant') || isType(c.g, id, 'Sorcery')) as Pred,
  permanentCard: ((c, id) => chars(c.g, id).types.some((t) => ['Artifact', 'Battle', 'Creature', 'Enchantment', 'Land', 'Planeswalker'].includes(t))) as Pred,
  type: (t: string): Pred => (c, id) => isType(c.g, id, t),
  subtype: (t: string): Pred => (c, id) => chars(c.g, id).subtypes.includes(t),
  token: ((c, id) => !!c.g.state.objects[id]?.isToken) as Pred,
  nontoken: ((c, id) => !c.g.state.objects[id]?.isToken) as Pred,
  legendary: ((c, id) => chars(c.g, id).supertypes.includes('Legendary')) as Pred,
  basic: ((c, id) => chars(c.g, id).supertypes.includes('Basic')) as Pred,
  yours: ((c, id) => controllerOf(c.g, id) === c.you) as Pred,
  ownedByYou: ((c, id) => c.g.state.objects[id]?.owner === c.you) as Pred,
  opponents: ((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id))) as Pred,
  other: ((c, id) => id !== c.source) as Pred,
  tapped: ((c, id) => !!c.g.state.objects[id]?.tapped) as Pred,
  untapped: ((c, id) => !c.g.state.objects[id]?.tapped) as Pred,
  color: (col: Color): Pred => (c, id) => chars(c.g, id).colors.includes(col),
  monocolored: ((c, id) => chars(c.g, id).colors.length === 1) as Pred,
  kw: (k: string): Pred => (c, id) => hasKw(c.g, id, k),
  mvAtMost: (n: number | ((c: SCtx) => number)): Pred => (c, id) => manaValue(c.g, id) <= (typeof n === 'function' ? n(c) : n),
  mvAtLeast: (n: number): Pred => (c, id) => manaValue(c.g, id) >= n,
  powerAtMost: (n: number | ((c: SCtx) => number)): Pred => (c, id) => power(c.g, id) <= (typeof n === 'function' ? n(c) : n),
  toughnessAtMost: (n: number): Pred => (c, id) => toughness(c.g, id) <= n,
  withCounter: (kind?: string): Pred => (c, id) => {
    const cs = c.g.state.objects[id]?.counters ?? {};
    return kind ? (cs[kind] ?? 0) > 0 : Object.values(cs).some((v) => v > 0);
  },
  enchanted: ((c, id) => c.g.state.zones.battlefield.some((a) => c.g.state.objects[a].attachedTo === id && chars(c.g, a).subtypes.includes('Aura'))) as Pred,
};

export function and(...ps: Pred[]): Pred { return (c, id) => ps.every((p) => p(c, id)); }
export function or(...ps: Pred[]): Pred { return (c, id) => ps.some((p) => p(c, id)); }
export function not(p: Pred): Pred { return (c, id) => !p(c, id); }

// ---------------------------------------------------------------------------
// Alvos
// ---------------------------------------------------------------------------
function objSpec(label: string, pred?: Pred, extra: Partial<TargetSpec> = {}): TargetSpec {
  return { what: 'object', label, filter: pred ? (c, t) => t.kind === 'obj' && pred(c, t.id) : undefined, ...extra };
}

export const t = {
  creature: (pred?: Pred, label = 'criatura alvo'): TargetSpec => objSpec(label, pred ? and(is.creature, pred) : is.creature),
  permanent: (pred?: Pred, label = 'permanente alvo'): TargetSpec => objSpec(label, pred),
  nonlandPermanent: (pred?: Pred, label = 'permanente não terreno alvo'): TargetSpec => objSpec(label, pred ? and(is.nonland, pred) : is.nonland),
  artifact: (pred?: Pred, label = 'artefato alvo'): TargetSpec => objSpec(label, pred ? and(is.artifact, pred) : is.artifact),
  enchantment: (pred?: Pred, label = 'encantamento alvo'): TargetSpec => objSpec(label, pred ? and(is.enchantment, pred) : is.enchantment),
  land: (pred?: Pred, label = 'terreno alvo'): TargetSpec => objSpec(label, pred ? and(is.land, pred) : is.land),
  player: (pred?: (c: SCtx, p: PlayerId) => boolean, label = 'jogador alvo'): TargetSpec => ({ what: 'player', label, filter: pred ? (c, t) => t.kind === 'player' && pred(c, t.id) : undefined }),
  opponent: (label = 'oponente alvo'): TargetSpec => ({ what: 'player', label, filter: (c, t) => t.kind === 'player' && c.g.isOpponent(c.you, t.id) }),
  any: (label = 'qualquer alvo'): TargetSpec => ({ what: 'any', label }),
  creatureOrPlayer: (label = 'criatura ou jogador alvo'): TargetSpec => ({ what: 'any', label, filter: (c, t) => t.kind === 'player' || isCreature(c.g, t.id) }),
  playerOrPlaneswalker: (label = 'jogador ou planeswalker alvo'): TargetSpec => ({ what: 'any', label, filter: (c, t) => t.kind === 'player' || isType(c.g, t.id, 'Planeswalker') }),
  creatureOrPlaneswalker: (label = 'criatura ou planeswalker alvo'): TargetSpec => objSpec(label, or(is.creature, is.planeswalker)),
  spell: (pred?: Pred, label = 'mágica alvo'): TargetSpec => ({ what: 'spell', label, filter: pred ? (c, t) => t.kind === 'obj' && pred(c, t.id) : undefined }),
  card: (zone: ZoneName, pred?: Pred, label = 'carta alvo', whose: 'you' | 'any' | 'opponent' = 'you'): TargetSpec => ({
    what: 'card', zone, label,
    filter: (c, t) => {
      if (t.kind !== 'obj') return false;
      const o = c.g.state.objects[t.id];
      if (!o) return false;
      if (whose === 'you' && o.owner !== c.you) return false;
      if (whose === 'opponent' && !c.g.isOpponent(c.you, o.owner)) return false;
      return !pred || pred(c, t.id);
    },
  }),
};

export function upTo(n: number, spec: TargetSpec): TargetSpec { return { ...spec, min: 0, max: n }; }
export function exactly(n: number, spec: TargetSpec): TargetSpec { return { ...spec, min: n, max: n }; }
export function anyNumber(spec: TargetSpec): TargetSpec { return { ...spec, min: 0, max: 99 }; }

/** alvo i (grupo i, posição j) já checado na resolução */
export function tgt(c: Ctx, i = 0, j = 0): ObjId | null {
  const r = c.targets[i]?.[j];
  return r && r.kind === 'obj' && c.g.state.objects[r.id] ? r.id : null;
}
export function tgtPlayer(c: Ctx, i = 0, j = 0): PlayerId | null {
  const r = c.targets[i]?.[j];
  return r && r.kind === 'player' && !c.g.state.players[r.id].left ? r.id : null;
}
export function tgtRef(c: Ctx, i = 0, j = 0): TargetRef | null {
  const r = c.targets[i]?.[j] ?? null;
  if (!r) return null;
  if (r.kind === 'obj' && !c.g.state.objects[r.id]) return null;
  return r;
}
export function tgtsAll(c: Ctx, i = 0): ObjId[] {
  return (c.targets[i] ?? []).filter((r): r is TargetRef & { kind: 'obj' } => !!r && r.kind === 'obj' && !!c.g.state.objects[r.id]).map((r) => r.id);
}

// ---------------------------------------------------------------------------
// Custos em texto (como no Oracle): "{2}{B}, {T}, Sacrifice another creature"
// ---------------------------------------------------------------------------
const NUM: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };

function typePred(words: string): Pred {
  const w = words.toLowerCase().trim();
  const preds: Pred[] = [];
  for (const part of w.split(' or ')) {
    const p = part.trim().replace(/s$/, '');
    if (p === 'creature') preds.push(is.creature);
    else if (p === 'artifact') preds.push(is.artifact);
    else if (p === 'land') preds.push(is.land);
    else if (p === 'enchantment') preds.push(is.enchantment);
    else if (p === 'permanent') preds.push(() => true);
    else if (p === 'creature with defender') preds.push(and(is.creature, is.kw('defender')));
    else preds.push(is.subtype(part.trim().replace(/s$/, '').replace(/^./, (x) => x.toUpperCase())));
  }
  return or(...preds);
}

export function cost(text: string): CostPart[] {
  const parts: CostPart[] = [];
  const manaSyms = text.match(/^((\{[^}]+\})+)/);
  let rest = text;
  if (manaSyms && !/^\{[TQ]\}/.test(text)) {
    parts.push({ k: 'mana', cost: manaSyms[1] });
    rest = text.slice(manaSyms[1].length);
  }
  for (const raw of rest.split(',').map((x) => x.trim()).filter(Boolean)) {
    const s = raw.replace(/\.$/, '');
    let m: RegExpMatchArray | null;
    if (/^(\{[^}]+\})+$/.test(s) && !/^\{[TQ]\}$/.test(s)) parts.push({ k: 'mana', cost: s });
    else if (s === '{T}') parts.push({ k: 'tap' });
    else if (s === '{Q}') parts.push({ k: 'untap' });
    else if (/^Sacrifice (this|~)\b/.test(s)) parts.push({ k: 'sacrificeSelf' });
    else if ((m = s.match(/^Sacrifice (a|an|another|one|two|three|X) (other )?(.+)$/))) {
      const another = m[1] === 'another' || !!m[2];
      const n = m[1] === 'X' ? 'X' : (NUM[m[1]] ?? 1);
      const tp = typePred(m[3]);
      parts.push({ k: 'sacrifice', n, label: m[3], filter: another ? (c, id) => id !== c.source && tp(c, id) : tp });
    } else if (s === 'Discard a card') parts.push({ k: 'discard', n: 1 });
    else if (/^Discard this card/.test(s)) parts.push({ k: 'discardSelf' });
    else if ((m = s.match(/^Pay (\d+|X) life$/))) parts.push({ k: 'life', n: m[1] === 'X' ? 'X' : Number(m[1]) });
    else if (/^Exile (this|~)/.test(s)) parts.push({ k: 'exileSelf' });
    else if ((m = s.match(/^Exile (a|one|two|three|four|five) other cards? from your graveyard$/))) parts.push({ k: 'exileFromGraveyard', n: NUM[m[1]], other: true });
    else if ((m = s.match(/^Remove (a|an|one|two|three) ([^ ]+) counters? from (this|~)/))) parts.push({ k: 'removeCounter', kind: m[2], n: NUM[m[1]] ?? 1, fromSelf: true });
    else if ((m = s.match(/^Put (a|an) ([^ ]+) counter on (this|~)/))) parts.push({ k: 'addCounterSelf', kind: m[2], n: 1 });
    else if ((m = s.match(/^Blight (\d+|X)$/i))) parts.push({ k: 'blight', n: m[1] === 'X' ? 'X' : Number(m[1]) });
    else if ((m = s.match(/^Mill (a|one|two|three) cards?$/))) parts.push({ k: 'mill', n: NUM[m[1]] ?? 1 });
    else if ((m = s.match(/^Tap (a|one|two|three) untapped creatures? you control$/))) parts.push({ k: 'tapCreatures', n: NUM[m[1]] ?? 1 });
    else if ((m = s.match(/^([+−-])(\d+|X)$/))) parts.push({ k: 'loyalty', n: m[2] === 'X' ? 'X' : (m[1] === '+' ? 1 : -1) * Number(m[2]) });
    else if (s === '0') parts.push({ k: 'loyalty', n: 0 });
    else throw new Error(`Custo não reconhecido: "${s}" em "${text}"`);
  }
  return parts;
}

// ---------------------------------------------------------------------------
// Palavras-chave (CR 702)
// ---------------------------------------------------------------------------
export function keyword(name: string, param?: unknown): StaticDef {
  return { kind: 'static', kw: name, param, text: name };
}
export function keywords(...names: string[]): StaticDef[] {
  return names.map((n) => keyword(n));
}
/** proteção contra uma cor (CR 702.16) */
export function protectionFrom(color: Color): StaticDef {
  return keyword('protection', `color:${color}`);
}

// ---------------------------------------------------------------------------
// Mana (CR 605)
// ---------------------------------------------------------------------------
/**
 * mana('G') → {T}: Add {G}. mana(['R','W']) → {T}: Add {R} or {W}. mana('CC') → {C}{C}.
 * mana('any') → uma de qualquer cor.
 */
export function mana(produce: string | string[] | ((c: SCtx) => ManaType[][]), opts: { cost?: string; text?: string; extra?: ManaAbilityDef['extra']; condition?: ManaAbilityDef['condition']; restriction?: string; untilEndOfTurn?: boolean; onSpend?: string; oncePerTurn?: boolean } = {}): ManaAbilityDef {
  let fn: (c: SCtx) => ManaType[][];
  if (typeof produce === 'function') fn = produce;
  else if (produce === 'any') fn = () => [['W'], ['U'], ['B'], ['R'], ['G']];
  else if (Array.isArray(produce)) fn = () => produce.map((p) => p.split('') as ManaType[]);
  else fn = () => [produce.split('') as ManaType[]];
  return {
    kind: 'mana', cost: cost(opts.cost ?? '{T}'), produce: fn, text: opts.text, extra: opts.extra, condition: opts.condition,
    restriction: opts.restriction, untilEndOfTurn: opts.untilEndOfTurn, onSpend: opts.onSpend, oncePerTurn: opts.oncePerTurn,
  };
}

// ---------------------------------------------------------------------------
// Habilidades
// ---------------------------------------------------------------------------
export function activated(costText: string | CostPart[], effect: EffectFn, opts: Omit<Partial<ActivatedDef>, 'kind' | 'cost' | 'effect'> = {}): ActivatedDef {
  return { kind: 'activated', cost: typeof costText === 'string' ? cost(costText) : costText, effect, ...opts };
}

export function triggered(on: TriggerSpec, effect: EffectFn, opts: Omit<Partial<TriggeredDef>, 'kind' | 'on' | 'effect'> = {}): TriggeredDef {
  return { kind: 'triggered', on, effect, ...opts };
}

export function staticAbility(opts: Omit<StaticDef, 'kind'>): StaticDef {
  return { kind: 'static', ...opts };
}

export function asEnters(fn: (c: SCtx, ev: EnterEvent) => Gen<void> | void, text?: string): ReplacementDef {
  return {
    kind: 'replacement', text,
    *enters(c, ev) { const r = fn(c, ev); if (r && typeof (r as Gen<void>).next === 'function') yield* r as Gen<void>; },
  };
}

/** "Este terreno entra virado" (CR 614.1c) */
export function entersTapped(unless?: (c: SCtx, ev: EnterEvent) => boolean): ReplacementDef {
  return asEnters((c, ev) => { if (!unless || !unless(c, ev)) ev.tapped = true; }, unless ? 'Entra virado a menos que…' : 'Entra virado.');
}

export function entersWithCounters(kind: string, n: number | ((c: SCtx, ev: EnterEvent) => number)): ReplacementDef {
  return asEnters((c, ev) => {
    const k = typeof n === 'function' ? n(c, ev) : n;
    if (k > 0) ev.counters[kind] = (ev.counters[kind] ?? 0) + k;
  }, `Entra com marcadores ${kind}.`);
}

// ---------------------------------------------------------------------------
// Gatilhos (CR 603)
// ---------------------------------------------------------------------------
type ZoneEv = Extract<GameEvent, { type: 'zone' }>;

/** informação de um objeto no momento do evento: atual ou última conhecida */
export function lkiChars(g: G, id: ObjId): Chars | null {
  if (g.state.objects[id]) { try { return chars(g, id); } catch { return null; } }
  return g.state.lki[id]?.chars ?? null;
}
export function lkiObj(g: G, id: ObjId): GameObject | null {
  return g.state.objects[id] ?? g.state.lki[id]?.obj ?? null;
}

export const on = {
  /** "Quando este permanente entra" */
  selfEnters: (): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source }),
  /** "Sempre que um/uma [pred] entra" (pred avaliado no objeto que entrou) */
  enters: (pred: Pred): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && pred(c, e.obj) }),
  /** "um ou mais [pred] entram" */
  entersBatch: (pred: Pred): TriggerSpec => ({ kind: 'batch', match: (evs, c) => evs.some((e) => e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && pred(c, e.obj)) }),
  /** "Quando esta criatura morre" (olha para trás, CR 603.10a) */
  selfDies: (): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === c.source }),
  selfLeaves: (): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'zone' && e.from === 'battlefield' && e.old === c.source }),
  /** "Sempre que [pred na LKI] morre" */
  dies: (pred: (c: TriggerCtx, lki: Chars, old: GameObject, e: ZoneEv) => boolean): TriggerSpec => ({
    kind: 'event',
    match: (e, c) => {
      if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
      const l = c.g.state.lki[e.old];
      return !!l && l.chars.types.includes('Creature') && pred(c, l.chars, l.obj, e);
    },
  }),
  selfAttacks: (): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source) }),
  /** "Sempre que você ataca" (CR 508.3d) */
  youAttack: (): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'attackers' && e.player === c.you && e.attackers.length > 0 }),
  /** "Sempre que [pred] ataca", por criatura */
  attacks: (pred: Pred): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'attackers' && e.attackers.some((a) => pred(c, a.obj)) }),
  selfBlocks: (): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'blockers' && e.blocks.some(([b]) => b === c.source) }),
  selfDealsCombatDamageToPlayer: (): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'damage' && e.combat && e.source === c.source && e.target.kind === 'player' ? { player: e.target.id, amount: e.amount } : false }),
  /** "Sempre que você conjura [pred]" */
  youCast: (pred: Pred = () => true): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'cast' && e.player === c.you && !!c.g.state.objects[e.obj] && pred(c, e.obj) ? { spell: e.obj } : false }),
  step: (step: Step, whose: 'you' | 'each' | 'opponent' = 'you', firstMain = false): TriggerSpec => ({ kind: 'step', step, whose, firstMain }),
  upkeep: (whose: 'you' | 'each' | 'opponent' = 'you'): TriggerSpec => ({ kind: 'step', step: 'upkeep', whose }),
  endStep: (whose: 'you' | 'each' | 'opponent' = 'you'): TriggerSpec => ({ kind: 'step', step: 'end', whose }),
  /** "No início do combate no seu turno" */
  beginCombat: (whose: 'you' | 'each' | 'opponent' = 'you'): TriggerSpec => ({ kind: 'step', step: 'beginCombat', whose }),
  firstMain: (): TriggerSpec => ({ kind: 'step', step: 'main1', whose: 'you', firstMain: true }),
  /** "Sempre que você ganha vida" */
  youGainLife: (): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'lifeGain' && e.player === c.you ? { amount: e.amount } : false }),
  /** Landfall: "Sempre que um terreno que você controla entra" */
  landfall: (): TriggerSpec => ({ kind: 'event', match: (e, c) => e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && isLand(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you }),
  custom: (match: (e: GameEvent, c: TriggerCtx) => boolean | Record<string, unknown>): TriggerSpec => ({ kind: 'event', match }),
  batch: (match: (evs: GameEvent[], c: TriggerCtx) => boolean | Record<string, unknown>): TriggerSpec => ({ kind: 'batch', match }),
};

// ---------------------------------------------------------------------------
// Atalhos de habilidades comuns
// ---------------------------------------------------------------------------
export function etb(effect: EffectFn, opts: Omit<Partial<TriggeredDef>, 'kind' | 'on' | 'effect'> = {}): TriggeredDef {
  return triggered(on.selfEnters(), effect, opts);
}

/** Equipar [custo] (CR 702.6) */
export function equip(costText: string): ActivatedDef {
  return activated(costText, function* (c) {
    const target = tgt(c);
    if (target !== null && c.g.state.objects[c.source]) attach(c.g, c.source, target);
  }, { kw: 'equip', param: costText, timing: 'sorcery', targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: `Equipar ${costText}` });
}

/** Ciclagem [custo] (CR 702.29) */
export function cycling(costText: string): ActivatedDef {
  return activated([...cost(costText), { k: 'discardSelf' }], function* (c) { yield* draw(c.g, c.you, 1); }, { kw: 'cycling', param: costText, zones: ['hand'], text: `Ciclagem ${costText}` });
}

/** Ciclagem de terreno básico [custo] (CR 702.29e) */
export function basicLandcycling(costText: string): ActivatedDef {
  return activated([...cost(costText), { k: 'discardSelf' }], function* (c) {
    const found = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => chars(c.g, id).supertypes.includes('Basic') && isLand(c.g, id), prompt: 'Procure uma carta de terreno básico' });
    if (found.length) {
      c.g.log(`${c.g.state.players[c.you].name} revela ${found.map((id) => nameOf(c.g, id)).join(', ')}.`);
      yield* moveObjects(c.g, found.map((id) => ({ id, to: 'hand' as ZoneName })), 'search');
    }
    shuffleLibrary(c.g, c.you);
  }, { kw: 'basic landcycling', param: costText, zones: ['hand'], text: `Ciclagem de terreno básico ${costText}` });
}

/** Retrospectiva (CR 702.34) */
export function flashback(manaCost: string, parts: CostPart[] = []): AltCastDef {
  return { key: 'flashback', label: `retrospectiva ${manaCost}`, zone: 'graveyard', mana: manaCost, parts, exileAfter: true };
}

/** Fuga (CR 702.138) */
export function escape(manaCost: string, exileOthers: number): AltCastDef {
  return { key: 'escape', label: `fuga ${manaCost}`, zone: 'graveyard', mana: manaCost, parts: [{ k: 'exileFromGraveyard', n: exileOthers, other: true }] };
}

export function additionalCost(key: string, label: string, parts: CostPart[], opts: Partial<AdditionalCostDef> = {}): AdditionalCostDef {
  return { key, label, parts, optional: false, ...opts };
}

export function modal(min: number, max: number, modes: ModeSpec['modes'], extra: Partial<ModeSpec> = {}): ModeSpec {
  return { min, max, modes, ...extra };
}

/** busca de terreno básico para o campo (Evolving Wilds, Cultivate…) */
export function* fetchBasicToBattlefield(c: Ctx, n: number, opts: { tapped?: boolean; filter?: (id: ObjId) => boolean; prompt?: string; player?: PlayerId } = {}): Gen<ObjId[]> {
  const p = opts.player ?? c.you;
  const found = yield* searchLibrary(c.g, p, p, {
    max: n, filter: (id) => isLand(c.g, id) && chars(c.g, id).supertypes.includes('Basic') && (!opts.filter || opts.filter(id)),
    prompt: opts.prompt ?? `Procure até ${n} carta(s) de terreno básico`,
  });
  const res = found.length ? yield* putOntoBattlefield(c.g, found.map((id) => ({ id, controller: p, tapped: opts.tapped ?? true })), 'search') : [];
  shuffleLibrary(c.g, p);
  return res;
}

export { controlledBy };

// ---------------------------------------------------------------------------
// Estáticas de Aura e Equipamento ("A criatura encantada/equipada recebe…")
// ---------------------------------------------------------------------------
import type { Mod } from './types.ts';
import { oracle } from './oracle.ts';

/** estática que afeta o objeto ao qual esta Aura/Equipamento está preso */
export function attachedGets(mods: (c: SCtx, obj: GameObject) => Mod[], text?: string): StaticDef {
  return {
    kind: 'static', text,
    affects: (c, o) => c.g.state.objects[c.source]?.attachedTo === o.id,
    mods,
  };
}

/** estática sobre o próprio objeto ("Esta criatura recebe +1/+1 para cada…") */
export function selfGets(mods: (c: SCtx, obj: GameObject) => Mod[], text?: string, extra: Partial<StaticDef> = {}): StaticDef {
  return { kind: 'static', text, affects: (c, o) => o.id === c.source, mods, ...extra };
}

/** estática "criaturas que você controla recebem…" e afins */
export function anthem(pred: Pred, mods: (c: SCtx, obj: GameObject) => Mod[], text?: string): StaticDef {
  return { kind: 'static', text, affects: (c, o) => pred(c, o.id), mods };
}

/** cores da identidade de cor dos comandantes de um jogador (CR 903.4) */
export function commanderIdentity(g: G, p: PlayerId): Color[] {
  const set = new Set<Color>();
  for (const cid of g.state.players[p].commanders) {
    const def = g.state.cards[cid]?.def;
    if (def) for (const col of oracle(def).colorIdentity) set.add(col);
  }
  return (['W', 'U', 'B', 'R', 'G'] as Color[]).filter((x) => set.has(x));
}

/** mana de uma cor da identidade do comandante (Arcane Signet, Command Tower) — CR 903.4f */
export function manaCommanderIdentity(opts: { cost?: string; text?: string } = {}): ManaAbilityDef {
  return mana((c) => commanderIdentity(c.g, c.you).map((col) => [col]), { cost: opts.cost, text: opts.text ?? '{T}: Adicione uma mana de qualquer cor da identidade de cor do seu comandante.' });
}

/** Encantar [especificação] (CR 702.5) */
export function enchant(spec: TargetSpec): TargetSpec {
  return spec;
}

// ---------------------------------------------------------------------------
// Terrenos: padrões frequentes
// ---------------------------------------------------------------------------
import { dealDamage as dealDamageAct, lookAndArrange as lookAndArrangeAct, returnToHand as returnToHandAct, yesNoReveal } from './dsl-helpers.ts';

function landsYouControl(c: SCtx, pred: (id: ObjId) => boolean = () => true): ObjId[] {
  return c.g.state.zones.battlefield.filter((id) => !c.g.state.objects[id].phasedOut && controllerOf(c.g, id) === c.you && isLand(c.g, id) && pred(id));
}

export const land = {
  /** "Este terreno entra virado." */
  tapped: (): ReplacementDef => entersTapped(),
  /** "…a menos que você controle dois ou mais terrenos básicos." */
  tappedUnlessBasics: (n = 2): ReplacementDef => entersTapped((c) => landsYouControl(c, (id) => chars(c.g, id).supertypes.includes('Basic')).length >= n),
  /** "…a menos que você controle um(a) A ou um(a) B." (checklands) */
  tappedUnlessControl: (...subtypes: string[]): ReplacementDef => entersTapped((c) => landsYouControl(c, (id) => chars(c.g, id).subtypes.some((s) => subtypes.includes(s))).length > 0),
  /** "…a menos que você controle dois ou mais outros terrenos." */
  tappedUnlessOtherLands: (n: number): ReplacementDef => entersTapped((c) => landsYouControl(c).length >= n),
  /** "…a menos que seus oponentes controlem oito ou mais terrenos." (soma entre os oponentes) */
  tappedUnlessOpponentsLands: (n: number): ReplacementDef => entersTapped((c) => c.g.state.zones.battlefield.filter((id) => isLand(c.g, id) && c.g.isOpponent(c.you, controllerOf(c.g, id))).length >= n),
  /** "…a menos que você controle três ou mais outros [tipo]." */
  tappedUnlessOtherOfType: (subtype: string, n: number): ReplacementDef => entersTapped((c) => landsYouControl(c, (id) => chars(c.g, id).subtypes.includes(subtype)).length >= n),
  /** snarl: "Ao entrar, você pode revelar um card A ou B da mão. Se não fizer, entra virado." */
  snarl: (...subtypes: string[]): ReplacementDef => asEnters(function* (c, ev) {
    const cands = c.g.state.zones.hand[c.you].filter((id) => id !== ev.obj && chars(c.g, id).subtypes.some((s) => subtypes.includes(s)));
    const revealed = cands.length > 0 && (yield* yesNoReveal(c, cands, subtypes));
    if (!revealed) ev.tapped = true;
  }, `Ao entrar, você pode revelar uma carta ${subtypes.join(' ou ')} da mão; se não revelar, entra virado.`),
  /** terreno de dor: "{T}: Adicione {A} ou {B}. Este terreno causa 1 de dano a você." */
  pain: (colors: string[]): ManaAbilityDef => mana(colors, {
    text: `{T}: Adicione ${colors.map((x) => `{${x}}`).join(' ou ')}. Este terreno causa 1 de dano a você.`,
    *extra(c) { dealDamageAct(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]); },
  }),
  /** filtro: "{A/B}, {T}: Adicione {A}{A}, {A}{B} ou {B}{B}." */
  filter: (a: string, b: string): ManaAbilityDef => mana([a + a, a + b, b + b], { cost: `{${a}/${b}}, {T}`, text: `{${a}/${b}}, {T}: Adicione {${a}}{${a}}, {${a}}{${b}} ou {${b}}{${b}}.` }),
  /** "Quando este terreno entra, vidência 1." */
  scryOnEnter: (): TriggeredDef => etb(function* (c) { yield* lookAndArrangeAct(c.g, c.you, 1, 'scry'); }, { text: 'Quando entra, vidência 1.' }),
  /** "[custo], {T}: Vidência 1." */
  scryAbility: (manaCost: string): ActivatedDef => activated(`${manaCost}, {T}`, function* (c) { yield* lookAndArrangeAct(c.g, c.you, 1, 'scry'); }, { text: `${manaCost}, {T}: Vidência 1.` }),
  /** "[custo], {T}: Vigiar 1." */
  surveilAbility: (manaCost: string): ActivatedDef => activated(`${manaCost}, {T}`, function* (c) { yield* lookAndArrangeAct(c.g, c.you, 1, 'surveil'); }, { text: `${manaCost}, {T}: Vigiar 1.` }),
  /** terreno-carnário: "Quando entra, devolva um terreno que você controla para a mão do dono." */
  bounceLand: (): TriggeredDef => etb(function* (c) {
    const mine = landsYouControl(c);
    if (mine.length === 0) return;
    const [pick] = yield* askModule.chooseItems(c.g, c.you, 'Devolva um terreno que você controla para a mão', mine.map((id) => askModule.objItem(c.g, id, nameOf(c.g, id))), 1, 1);
    yield* returnToHandAct(c.g, [Number(pick)]);
  }, { text: 'Quando entra, devolva um terreno que você controla para a mão do dono.' }),
  /** "{T}, Sacrifique este terreno: Procure uma carta de terreno básico, coloque-a no campo virada, depois embaralhe." */
  fetchBasic: (): ActivatedDef => activated('{T}, Sacrifice this land', function* (c) {
    yield* fetchBasicToBattlefield(c, 1, { prompt: 'Procure uma carta de terreno básico' });
  }, { text: '{T}, Sacrifique este terreno: Procure uma carta de terreno básico e coloque-a no campo virada; depois embaralhe.' }),
};

import * as askModule from './ask.ts';
