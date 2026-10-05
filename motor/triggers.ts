// Emissão de eventos e detecção de gatilhos (CR 603).
// Um lote de eventos simultâneos é conferido contra:
//  - habilidades engatilhadas dos permanentes (e de cartas em zonas onde a habilidade funciona);
//  - para eventos de sair do campo, as habilidades dos objetos como existiam antes (CR 603.10a);
//  - gatilhos atrasados (CR 603.7).

import { chars, hooks } from './chars.ts';
import { registry, type TriggerCtx, type TriggeredDef } from './defs.ts';
import type { GameEvent } from './events.ts';
import type { G } from './game-context.ts';
import type { Chars, GameObject, ObjId, PlayerId, ZoneName } from './types.ts';

let offZoneTriggers: Set<string> | null = null;
function offZone(): Set<string> {
  if (!offZoneTriggers || offZoneTriggers.size === 0) {
    offZoneTriggers = new Set();
    for (const [id, a] of registry.abilities) if (a.kind === 'triggered' && a.zones && a.zones.some((z) => z !== 'battlefield')) offZoneTriggers.add(id);
  }
  return offZoneTriggers;
}
export function resetTriggerIndex(): void { offZoneTriggers = null; }

interface Source { obj: GameObject; chars: Chars; zone: ZoneName; departed: boolean; controller: PlayerId }

function updateStats(g: G, events: GameEvent[]): void {
  const st = g.state.turnStats;
  for (const e of events) {
    switch (e.type) {
      case 'lifeGain': st[e.player].lifeGained += e.amount; break;
      case 'lifeLoss': st[e.player].lifeLost += e.amount; break;
      case 'draw': st[e.player].cardsDrawn++; break;
      case 'zone':
        if (e.from === 'graveyard' && !e.token) st[e.owner].cardsLeftGraveyard++;
        if (e.to === 'graveyard' && e.from !== 'battlefield' && e.card !== null) st[e.owner].toGraveyardNotFromBattlefield.push(e.card);
        if (e.from === 'battlefield' && e.to === 'graveyard') {
          st[e.controller].permanentsToGraveyard++;
          const lki = g.state.lki[e.old];
          if (lki?.chars.types.includes('Creature')) st[e.controller].creaturesDied++;
        }
        break;
      case 'counters':
        if (e.target.kind === 'obj' && e.by !== null) {
          const c = safeChars(g, e.target.id);
          if (c?.types.includes('Creature')) st[e.by].countersPutOnCreatures += e.amount;
        }
        break;
      case 'sacrifice': {
        const lki = g.state.lki[e.old];
        if (lki?.chars.types.includes('Creature')) st[e.player].sacrificedCreature = true;
        break;
      }
      case 'attackers':
        if (e.attackers.length) {
          st[e.player].attacked = true;
          for (const a of e.attackers) if (a.target.kind === 'player' && !st[e.player].attackedPlayers.includes(a.target.id)) st[e.player].attackedPlayers.push(a.target.id);
        }
        break;
      default: break;
    }
  }
}

function safeChars(g: G, id: ObjId): Chars | null {
  try { return chars(g, id); } catch { return null; }
}

/** registra os eventos e cria os gatilhos pendentes */
export function emit(g: G, events: GameEvent[]): void {
  if (events.length === 0) return;
  updateStats(g, events);
  const s = g.state;
  const sources: Source[] = [];
  for (const id of s.zones.battlefield) {
    const o = s.objects[id];
    if (o.phasedOut) continue;
    const c = chars(g, id);
    sources.push({ obj: o, chars: c, zone: 'battlefield', departed: false, controller: c.controller });
  }
  const off = offZone();
  if (off.size > 0) {
    for (const zone of ['graveyard', 'hand', 'exile', 'command', 'library', 'stack'] as ZoneName[]) {
      const ids = zone === 'graveyard' || zone === 'hand' || zone === 'library' ? s.zones[zone].flat() : s.zones[zone];
      for (const id of ids) {
        const o = s.objects[id];
        const c = chars(g, id);
        if (c.abilities.some((a) => off.has(a.id))) sources.push({ obj: o, chars: c, zone, departed: false, controller: zone === 'stack' ? (o.stack?.controller ?? o.controller) : o.owner });
      }
    }
  }
  // CR 603.10a: objetos que saíram do campo neste lote "olham para trás"
  const leaving = events.filter((e) => (e.type === 'zone' && e.from === 'battlefield') || e.type === 'sacrifice' || e.type === 'phaseOut');
  const seen = new Set<ObjId>();
  for (const e of leaving) {
    const old = e.type === 'zone' || e.type === 'sacrifice' ? e.old : (e as { obj: ObjId }).obj;
    if (seen.has(old)) continue;
    seen.add(old);
    const l = s.lki[old];
    if (!l || l.obj.zone !== 'battlefield') continue;
    sources.push({ obj: l.obj, chars: l.chars, zone: 'battlefield', departed: true, controller: l.chars.controller });
  }

  for (const src of sources) {
    for (const inst of src.chars.abilities) {
      const def = registry.abilities.get(inst.id);
      if (!def || def.kind !== 'triggered') continue;
      const zones = def.zones ?? ['battlefield'];
      if (!zones.includes(src.zone)) continue;
      const evs = src.departed ? leaving : events;
      if (evs.length === 0) continue;
      checkAbility(g, def, src, evs);
    }
  }
  // gatilhos atrasados
  for (const d of [...s.delayedTriggers]) {
    const def = registry.abilities.get(d.abilityId) as TriggeredDef | undefined;
    if (!def) continue;
    const srcObj = s.objects[d.source] ?? s.lki[d.source]?.obj;
    if (!srcObj) continue;
    const ctx: TriggerCtx = { g, you: d.controller, source: d.source, obj: srcObj, chars: safeChars(g, d.source) ?? s.lki[d.source]?.chars ?? chars(g, d.source) };
    (ctx as TriggerCtx & { delayed: typeof d }).delayed = d;
    const results = matchSpec(g, def, ctx, events);
    for (const r of results) {
      addPending(g, d.abilityId, d.source, d.controller, r, d.data);
      if (d.once) { s.delayedTriggers = s.delayedTriggers.filter((x) => x.id !== d.id); break; }
    }
  }
  // regras do monarca (CR 725.2): dano de combate ao monarca passa a designação
  for (const e of events) {
    if (e.type === 'damage' && e.combat && e.target.kind === 'player' && s.monarch === e.target.id && e.controller !== e.target.id) {
      addPending(g, 'rule:monarchSteal', e.source, e.controller, { player: e.controller }, {});
    }
    if (e.type === 'step' && e.step === 'end' && s.monarch !== null && s.monarch === e.active) {
      addPending(g, 'rule:monarchDraw', -1, s.monarch, {}, {});
    }
  }
}

function matchSpec(g: G, def: TriggeredDef, ctx: TriggerCtx, events: GameEvent[]): Record<string, unknown>[] {
  return matchWithCause(g, def, ctx, events).map((x) => x.r);
}

/** disparos com o evento que causou cada um (null para lotes e etapas) */
function matchWithCause(g: G, def: TriggeredDef, ctx: TriggerCtx, events: GameEvent[]): { r: Record<string, unknown>; cause: GameEvent | null }[] {
  const out: { r: Record<string, unknown>; cause: GameEvent | null }[] = [];
  const on = def.on;
  if (on.kind === 'step') {
    for (const e of events) {
      if (e.type !== 'step' || e.step !== on.step) continue;
      if (on.firstMain && !e.firstMain) continue;
      if (on.whose === 'you' && e.active !== ctx.you) continue;
      if (on.whose === 'opponent' && !g.isOpponent(ctx.you, e.active)) continue;
      out.push({ r: { step: e.step, active: e.active }, cause: null });
    }
  } else if (on.kind === 'event') {
    for (const e of events) {
      const r = on.match(e, ctx);
      if (Array.isArray(r)) out.push(...r.map((x) => ({ r: x, cause: e })));
      else if (r) out.push({ r: typeof r === 'object' ? r : (e as unknown as Record<string, unknown>), cause: e });
    }
  } else {
    const r = on.match(events, ctx);
    if (Array.isArray(r)) out.push(...r.map((x) => ({ r: x, cause: null })));
    else if (r) out.push({ r: typeof r === 'object' ? r : {}, cause: null });
  }
  return out;
}

function checkAbility(g: G, def: TriggeredDef, src: Source, events: GameEvent[]): void {
  const s = g.state;
  const ctx: TriggerCtx = { g, you: src.controller, source: src.obj.id, obj: src.obj, chars: src.chars };
  const results = matchWithCause(g, def, ctx, events);
  for (const { r, cause } of results) {
    if (def.oncePerTurn) {
      const o = s.objects[src.obj.id];
      const key = def.id!;
      if (o && o.usedThisTurn[key] === s.turn.number) continue;
      if (o) o.usedThisTurn[key] = s.turn.number;
    }
    if (def.condition && !def.condition({ g, you: src.controller, source: src.obj.id, event: r })) continue;
    let times = 1;
    for (const h of hooks(g, 'extraTriggers')) times += h.fn(h.ctx, { abilityId: def.id!, source: src.obj.id, controller: src.controller, event: r, cause });
    for (let i = 0; i < times; i++) addPending(g, def.id!, src.obj.id, src.controller, r, {});
  }
}

export function addPending(g: G, abilityId: string, source: ObjId, controller: PlayerId, event: Record<string, unknown>, data: Record<string, unknown>): void {
  g.state.pendingTriggers.push({ abilityId, source, controller, event: JSON.parse(JSON.stringify(event)), data, seq: ++g.state.triggerSeq });
}
