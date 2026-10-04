// Efeitos compostos usados por muitas cartas: duração "até o fim do turno", gatilhos atrasados
// e reflexivos, pagar durante a resolução, sacrifícios por jogador, buscas e afins.

import { addCounters, controlledBy, creaturesOf, discard, draw, moveObjects, putOntoBattlefield, sacrifice, searchLibrary, shuffleLibrary } from './actions.ts';
import { chooseItems, objItem, yesNo } from './ask.ts';
import { abilityDefs, chars, controllerOf, isCreature, isLand, nameOf } from './chars.ts';
import { payMana } from './costs.ts';
import { defineAbility, registry, type AbilityDef, type Ctx, type Gen, type ManaAbilityDef, type SCtx, type TriggeredDef } from './defs.ts';
import type { G } from './game-context.ts';
import { parseCost } from './mana.ts';
import { BASIC_LAND_MANA, oracle, allOracleNames } from './oracle.ts';
import { addEffect } from './state.ts';
import { addPending } from './triggers.ts';
import type { Duration, ManaType, Mod, ObjId, PlayerId, ZoneName } from './types.ts';

// ---------------------------------------------------------------------------
// Efeitos com duração
// ---------------------------------------------------------------------------
export function untilEndOfTurn(c: Ctx | SCtx & { you: PlayerId }, ids: ObjId[], mods: Mod[]): void {
  if (ids.length === 0) return;
  addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'endOfTurn' }, affected: ids, mods });
}

export function withDuration(c: Ctx, ids: ObjId[], mods: Mod[], duration: Duration): void {
  if (ids.length === 0 && !mods.some((m) => m.k === 'rule')) return;
  addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration, affected: ids, mods });
}

/** efeito de regra que afeta jogadores (ex.: prevenção de Inkshield) */
export function ruleEffect(c: Ctx, id: string, duration: Duration, opts: { players?: PlayerId[]; objs?: ObjId[]; params?: Record<string, unknown> } = {}): void {
  addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration, affected: opts.objs ?? null, affectedPlayers: opts.players, mods: [{ k: 'rule', id, params: opts.params }] });
}

// ---------------------------------------------------------------------------
// Gatilhos atrasados (CR 603.7) e reflexivos (CR 603.12)
// ---------------------------------------------------------------------------
export function delayed(c: Ctx, abilityId: string, opts: { data?: Record<string, unknown>; once?: boolean; expiresTurn?: number | null } = {}): void {
  const s = c.g.state;
  s.delayedTriggers.push({
    id: s.nextId++, abilityId, source: c.source, controller: c.you, data: opts.data ?? {}, once: opts.once ?? true,
    expiresTurn: opts.expiresTurn ?? null, createdTurn: s.turn.number, createdStep: s.turn.step,
  });
  c.g.bump();
}

/** CR 603.12: "Quando você fizer isso, …" — dispara agora e vai para a pilha na próxima vez que alguém receberia prioridade */
export function reflexive(c: Ctx, abilityId: string, data: Record<string, unknown> = {}): void {
  addPending(c.g, abilityId, c.source, c.you, {}, data);
}

/** contexto do gatilho atrasado: quando foi criado */
export function delayedInfo(c: { delayed?: { createdTurn: number; createdStep: string; data: Record<string, unknown> } }): { createdTurn: number; createdStep: string; data: Record<string, unknown> } | null {
  return c.delayed ?? null;
}

/** "no início da manutenção do próximo turno": não dispara na manutenção do turno em que foi criado */
export function nextUpkeepTrigger(effect: TriggeredDef['effect'], text: string): TriggeredDef {
  return {
    kind: 'triggered', text, effect,
    on: { kind: 'event', match: (e, c) => e.type === 'step' && e.step === 'upkeep' && c.g.state.turn.number > ((c as unknown as { delayed?: { createdTurn: number } }).delayed?.createdTurn ?? -1) },
  };
}

/** "no início da próxima etapa final" (CR 513.2: criado na etapa final, espera a do próximo turno) */
export function nextEndStepTrigger(effect: TriggeredDef['effect'], text: string): TriggeredDef {
  return {
    kind: 'triggered', text, effect,
    on: {
      kind: 'event',
      match: (e, c) => {
        if (e.type !== 'step' || e.step !== 'end') return false;
        const d = (c as unknown as { delayed?: { createdTurn: number; createdStep: string } }).delayed;
        return !d || c.g.state.turn.number > d.createdTurn || d.createdStep !== 'end';
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Pagamentos durante a resolução (CR 608.2g, 118.12)
// ---------------------------------------------------------------------------
/** "Você pode pagar [custo]. Se fizer isso, …" — devolve true se pagou */
export function* mayPay(c: Ctx, player: PlayerId, manaCost: string, label: string): Gen<boolean> {
  const want = yield* yesNo(c.g, player, `Pagar ${manaCost} para ${label}?`);
  if (!want) return false;
  const r = yield* payMana(c.g, player, parseCost(manaCost), { purpose: { kind: 'effect' }, canCancel: true, label });
  return r !== null;
}

// ---------------------------------------------------------------------------
// Sacrifícios e escolhas por jogador (CR 101.4)
// ---------------------------------------------------------------------------
/**
 * Cada jogador da lista, em ordem APNAP, escolhe N permanentes seus que satisfaçam o filtro;
 * depois todos são sacrificados ao mesmo tempo. Devolve os ids sacrificados (antigos).
 */
export function* eachSacrifices(c: Ctx, players: PlayerId[], filter: (id: ObjId) => boolean, n = 1, label = 'uma criatura'): Gen<ObjId[]> {
  const chosen: ObjId[] = [];
  for (const p of c.g.apnap().filter((x) => players.includes(x))) {
    const mine = controlledBy(c.g, p, filter);
    if (mine.length === 0) continue;
    if (mine.length <= n) { chosen.push(...mine); continue; }
    const ids = yield* chooseItems(c.g, p, `Sacrifique ${label}`, mine.map((x) => objItem(c.g, x, nameOf(c.g, x))), n, n);
    chosen.push(...ids.map(Number));
  }
  yield* sacrifice(c.g, chosen);
  return chosen;
}

/** o próprio jogador sacrifica N permanentes que escolher */
export function* sacrificeYours(c: Ctx, player: PlayerId, filter: (id: ObjId) => boolean, n = 1, label = 'uma criatura'): Gen<ObjId[]> {
  return yield* eachSacrifices(c, [player], filter, n, label);
}

// ---------------------------------------------------------------------------
// Buscas (CR 701.23)
// ---------------------------------------------------------------------------
export function isBasicLand(g: G, id: ObjId): boolean {
  const ch = chars(g, id);
  return ch.types.includes('Land') && ch.supertypes.includes('Basic');
}

/** procura até N cartas e as põe numa zona; revela se pedido; embaralha no fim */
export function* searchTo(c: Ctx, player: PlayerId, filter: (id: ObjId) => boolean, n: number, to: ZoneName, opts: { tapped?: boolean; reveal?: boolean; prompt?: string; exactly?: boolean } = {}): Gen<ObjId[]> {
  const found = yield* searchLibrary(c.g, player, player, { max: n, min: opts.exactly ? n : 0, filter, prompt: opts.prompt ?? `Procure até ${n} carta(s)` });
  let res: ObjId[] = [];
  if (found.length) {
    if (opts.reveal) c.g.log(`${c.g.state.players[player].name} revela ${found.map((id) => nameOf(c.g, id)).join(', ')}.`, { rule: '701.20' });
    if (to === 'battlefield') res = yield* putOntoBattlefield(c.g, found.map((id) => ({ id, controller: player, tapped: opts.tapped })), 'search');
    else res = (yield* moveObjects(c.g, found.map((id) => ({ id, to })), 'search')).filter((x): x is ObjId => x !== null);
  }
  shuffleLibrary(c.g, player);
  return res;
}

/** "Seu controlador pode procurar um terreno básico, colocá-lo no campo [virado], depois embaralhar." */
export function* maySearchBasicToBattlefield(c: Ctx, player: PlayerId, tapped: boolean): Gen<void> {
  if (c.g.state.players[player].left) return;
  const want = yield* yesNo(c.g, player, `Procurar um terreno básico e colocá-lo no campo${tapped ? ' virado' : ''}?`);
  if (!want) return;
  yield* searchTo(c, player, (id) => isBasicLand(c.g, id), 1, 'battlefield', { tapped, prompt: 'Procure uma carta de terreno básico' });
}

// ---------------------------------------------------------------------------
// Compras e descartes compostos
// ---------------------------------------------------------------------------
/** "Compre uma carta, depois descarte uma carta" */
export function* loot(c: Ctx, player: PlayerId, nDraw = 1, nDiscard = 1): Gen<void> {
  yield* draw(c.g, player, nDraw);
  yield* discard(c.g, player, nDiscard);
}

// ---------------------------------------------------------------------------
// Mana que "um terreno de um oponente poderia produzir" (CR 106.7)
// ---------------------------------------------------------------------------
export function couldProduce(g: G, landId: ObjId, visiting = new Set<ObjId>()): ManaType[] {
  if (visiting.has(landId)) return [];
  visiting.add(landId);
  const out = new Set<ManaType>();
  for (const st of chars(g, landId).subtypes) if (BASIC_LAND_MANA[st]) out.add(BASIC_LAND_MANA[st]);
  for (const { def } of abilityDefs(g, landId)) {
    if (def.kind !== 'mana') continue;
    const m = def as ManaAbilityDef & { couldProduce?: (g: G, id: ObjId, v: Set<ObjId>) => ManaType[] };
    if (m.couldProduce) { for (const t of m.couldProduce(g, landId, visiting)) out.add(t); continue; }
    try { for (const alt of m.produce({ g, you: controllerOf(g, landId), source: landId })) for (const t of alt) if (t !== ('*' as ManaType)) out.add(t); } catch { /* sem mana definida */ }
  }
  return [...out];
}

export function opponentLandColors(g: G, player: PlayerId, visiting = new Set<ObjId>()): ManaType[] {
  const out = new Set<ManaType>();
  for (const id of g.state.zones.battlefield) {
    if (!isLand(g, id) || !g.isOpponent(player, controllerOf(g, id))) continue;
    for (const t of couldProduce(g, id, visiting)) out.add(t);
  }
  return (['W', 'U', 'B', 'R', 'G'] as ManaType[]).filter((t) => out.has(t)); // "de qualquer cor": sem incolor
}

// ---------------------------------------------------------------------------
// Tipos de criatura (para "escolha um tipo de criatura")
// ---------------------------------------------------------------------------
let creatureTypes: string[] | null = null;
export function allCreatureTypes(): string[] {
  if (!creatureTypes) {
    const set = new Set<string>();
    for (const n of allOracleNames()) for (const f of oracle(n).faces) if (f.types.includes('Creature') || f.types.includes('Kindred')) for (const st of f.subtypes) set.add(st);
    for (const t of registry.tokens.values()) if (t.types.includes('Creature')) for (const st of t.subtypes) set.add(st);
    creatureTypes = [...set].sort();
  }
  return creatureTypes;
}

export function* chooseCreatureType(g: G, player: PlayerId, prompt: string): Gen<string> {
  // sugere primeiro os tipos das criaturas do próprio jogador
  const mine = new Set<string>();
  for (const id of creaturesOf(g, player)) for (const st of chars(g, id).subtypes) mine.add(st);
  const all = allCreatureTypes();
  const ordered = [...all.filter((t) => mine.has(t)), ...all.filter((t) => !mine.has(t))];
  const [t] = yield* chooseItems(g, player, prompt, ordered.map((x) => ({ id: x, label: x })), 1, 1);
  return t;
}

// ---------------------------------------------------------------------------
// Diversos
// ---------------------------------------------------------------------------
export function isAttacking(g: G, id: ObjId): boolean {
  return !!g.state.combat?.attackers.some((a) => a.id === id && !a.removed);
}

export function countersOn(g: G, id: ObjId, kind: string): number {
  return g.state.objects[id]?.counters[kind] ?? 0;
}

export function greatestPower(g: G, ids: ObjId[]): number {
  return ids.reduce((m, id) => Math.max(m, chars(g, id).power ?? 0), -Infinity);
}

// ---------------------------------------------------------------------------
// Decaimento (CR 702.147a): "Esta criatura não pode bloquear." e
// "Quando esta criatura atacar, sacrifique-a no fim do combate."
// ---------------------------------------------------------------------------
defineAbility<TriggeredDef>('kw:decayedSacrifice', {
  kind: 'triggered', text: 'Decaimento: sacrifique esta criatura no fim do combate.',
  // "no fim do combate" = no início da etapa de fim de combate (CR 511.2)
  on: { kind: 'event', match: (e) => e.type === 'step' && e.step === 'endCombat' },
  *effect(c) {
    const obj = c.data.obj as ObjId | undefined;
    if (obj !== undefined && c.g.state.objects[obj]?.zone === 'battlefield') yield* sacrifice(c.g, [obj]);
  },
});

export function decayed(): AbilityDef[] {
  return [
    { kind: 'static', kw: 'decayed', text: 'Decaimento (esta criatura não pode bloquear; quando ela atacar, sacrifique-a no fim do combate)' },
    {
      kind: 'triggered', text: 'Quando esta criatura atacar, sacrifique-a no fim do combate.',
      on: { kind: 'event', match: (e, c) => e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source) },
      *effect(c) { delayed(c, 'kw:decayedSacrifice', { data: { obj: c.source } }); },
    },
  ];
}

export { addCounters, isCreature };
