// Ações do jogo usadas pelas regras e pelos efeitos das cartas. Aplicam efeitos de
// substituição e prevenção, registram eventos e disparam gatilhos.

import { chooseItems, objItem, yesNo, ask } from './ask.ts';
import { abilityDefs, chars, colorsOf, controllerOf, hasKw, hooks, isCreature, isType, kwParams, nameOf, printedChars, toughness } from './chars.ts';
import { registry, type EnterEvent, type Gen, type ReplacementDef, type SCtx, type TargetSpec } from './defs.ts';
import type { GameEvent } from './events.ts';
import type { G } from './game-context.ts';
import { shuffle as shuffleArr } from './rng.ts';
import { addEffect, createObject, destroyObject, moveRaw, newTimestamp, objOrLki, recordLki, type Position } from './state.ts';
import { emit } from './triggers.ts';
import { oracleLayout } from './oracle.ts';
import type { Answer, CardId, Color, CopyValues, Duration, GameObject, ManaType, ManaUnit, ObjId, PlayerId, TargetRef, ZoneName } from './types.ts';

// ---------------------------------------------------------------------------
// Mudança de zona
// ---------------------------------------------------------------------------
export interface MoveReq {
  id: ObjId;
  to: ZoneName;
  position?: Position;
  faceDown?: boolean;
  visibleTo?: GameObject['visibleTo'];
}

function isCommanderCard(g: G, o: GameObject): boolean {
  return o.card !== null && !!g.state.cards[o.card]?.isCommander;
}

/** destino final depois das substituições (CR 614, 616); o que a substituição faz junto vai para `depois` */
function* finalDestination(g: G, o: GameObject, to: ZoneName, cause: string, depois: (() => Gen<void>)[] = []): Gen<ZoneName> {
  let dest = to;
  // carta de ficha de "flashback": sai da pilha para o exílio (CR 702.34a)
  if (o.zone === 'stack' && o.stack?.data.exileOnLeave && to !== 'battlefield') dest = 'exile';
  // Quintorius, Loremaster: "se essa mágica fosse para um cemitério, vai para o fundo do grimório"
  if (o.zone === 'stack' && o.stack?.data.bottomInsteadOfGraveyard && dest === 'graveyard') dest = 'library';
  if (o.zone === 'battlefield' && dest !== 'battlefield') {
    // marcador de finalidade (CR 122.1h)
    if (dest === 'graveyard' && (o.counters.finality ?? 0) > 0) dest = 'exile';
    // "exile-o se fosse sair do campo" (desenterrar e similares)
    if (g.state.effects.some((e) => e.affected?.includes(o.id) && e.mods.some((m) => m.k === 'rule' && m.id === 'rule:exileIfLeaves'))) dest = 'exile';
    // substituições de outros permanentes (Kalitas: "se morreria, exile em vez disso…"). Com mais de uma, quem
    // controla o permanente afetado escolhe qual aplicar (CR 616.1); cada uma se aplica só uma vez (616.1f)
    const usadas = new Set<number>();
    for (;;) {
      const opcoes = hooks(g, 'leavesBattlefield').map((h, i) => ({ i, r: h.fn(h.ctx, o, dest), fonte: h.ctx.source })).filter((x) => x.r && !usadas.has(x.i));
      if (!opcoes.length) break;
      let esc = opcoes[0];
      if (opcoes.length > 1) {
        const [id] = yield* chooseItems(g, controllerOf(g, o.id), `${nameOf(g, o.id)} vai sair do campo: escolha a substituição a aplicar primeiro (CR 616.1)`,
          opcoes.map((x) => ({ id: String(x.i), label: x.r!.label ?? nameOf(g, x.fonte) })), 1, 1);
        esc = opcoes.find((x) => String(x.i) === id) ?? opcoes[0];
      }
      usadas.add(esc.i);
      dest = esc.r!.dest;
      if (esc.r!.then) depois.push(esc.r!.then);
    }
  }
  // comandante iria para mão ou grimório: o dono pode pô-lo na zona de comando (CR 903.9b)
  if ((dest === 'hand' || dest === 'library') && isCommanderCard(g, o) && cause !== 'cast') {
    const yes = yield* yesNo(g, o.owner, `Pôr ${nameOf(g, o.id)} na zona de comando em vez de ${dest === 'hand' ? 'na mão' : 'no grimório'}? (CR 903.9b)`);
    if (yes) dest = 'command';
  }
  return dest;
}

/**
 * Move objetos simultaneamente (exceto para o campo: use putOntoBattlefield).
 * Devolve os ids novos (null quando o objeto não se moveu).
 */
export function* moveObjects(g: G, reqs: MoveReq[], cause: string, by?: PlayerId): Gen<(ObjId | null)[]> {
  const out: (ObjId | null)[] = [];
  const events: GameEvent[] = [];
  const plans: { o: GameObject; dest: ZoneName; req: MoveReq }[] = [];
  const depois: (() => Gen<void>)[] = [];
  for (const r of reqs) {
    const o = g.state.objects[r.id];
    if (!o) { plans.push({ o: null as unknown as GameObject, dest: r.to, req: r }); continue; }
    const dest = yield* finalDestination(g, o, r.to, cause, depois);
    plans.push({ o, dest, req: r });
  }
  for (const { o, dest, req } of plans) {
    if (!o || !g.state.objects[o.id]) { out.push(null); continue; }
    // ficha ou cópia que já saiu do campo/pilha não muda mais de zona (CR 111.8)
    if ((o.isToken && o.zone !== 'battlefield') || (o.isCopy && o.zone !== 'stack')) { out.push(null); continue; }
    const from = o.zone;
    const controller = controllerOf(g, o.id);
    const pos = dest === 'library' && req.to !== 'library' ? 'bottom' : req.position;
    const newId = moveRaw(g, o.id, dest, { position: pos, faceDown: req.faceDown, visibleTo: req.visibleTo });
    out.push(newId);
    events.push({ type: 'zone', obj: newId, old: o.id, from, to: dest, card: o.card, owner: o.owner, controller, cause, token: o.isToken, by });
    if (cause === 'discard' && from === 'hand') events.push({ type: 'discard', player: o.owner, obj: newId, card: o.card });
    if (cause === 'sacrifice') events.push({ type: 'sacrifice', player: controller, old: o.id, obj: newId });
    if (from === 'battlefield') removeFromCombat(g, o.id);
  }
  emit(g, events);
  // o resto do evento de substituição (a ficha do Kalitas), depois de mover
  for (const f of depois) yield* f();
  return out;
}

export function* moveObject(g: G, id: ObjId, to: ZoneName, cause: string, opts: Omit<MoveReq, 'id' | 'to'> = {}, by?: PlayerId): Gen<ObjId | null> {
  const [r] = yield* moveObjects(g, [{ id, to, ...opts }], cause, by);
  return r;
}

export function removeFromCombat(g: G, id: ObjId): void {
  const c = g.state.combat;
  if (!c) return;
  for (const a of c.attackers) if (a.id === id) a.removed = true;
  c.blockers = c.blockers.filter((b) => b.id !== id);
  for (const a of c.attackers) a.blockers = a.blockers.filter((b) => b !== id);
}

// ---------------------------------------------------------------------------
// Entrar no campo (CR 614.1c-d, 614.12, 303.4f)
// ---------------------------------------------------------------------------
export interface EnterReq {
  id?: ObjId;
  /** ficha: definição registrada ou valores copiados */
  token?: { def?: string; copyOf?: CopyValues };
  controller: PlayerId;
  tapped?: boolean;
  attachTo?: ObjId | null;
  counters?: Record<string, number>;
  faceDown?: boolean;
  copyOf?: CopyValues | null;
  spell?: EnterEvent['spell'];
  choices?: Record<string, unknown>;
  attacking?: TargetRef;
  /** valores extras guardados no objeto */
  data?: Record<string, unknown>;
  /** face que fica para cima ao entrar ("volta ao campo transformado", CR 712.14) */
  face?: number;
}

function wouldBeChars(g: G, r: EnterReq) {
  if (r.token?.copyOf) return printedChars(r.token.copyOf.def, r.token.copyOf.face, r.controller);
  if (r.token?.def) return printedChars(r.token.def, 0, r.controller);
  const o = g.obj(r.id!);
  if (r.copyOf) return printedChars(r.copyOf.def, r.copyOf.face, o.owner);
  if (r.faceDown) return { ...printedChars(o.def, 0, o.owner), types: ['Creature'], abilities: [] };
  return printedChars(o.copyOf?.def ?? o.def, r.face ?? o.copyOf?.face ?? (o.zone === 'stack' ? o.face : 0), o.owner);
}

/** alvos legais para uma Aura (encantar) */
export function enchantCandidates(g: G, auraDef: string, face: number, controller: PlayerId, exclude: ObjId[] = [], auraId?: ObjId): ObjId[] {
  // "encantar a criatura posta no campo com esta Aura" (Animate Dead): substitui a habilidade de encantar impressa
  const fixo = auraId !== undefined ? (g.state.objects[auraId]?.data.enchantOverride as ObjId | undefined) : undefined;
  if (fixo !== undefined) {
    const f = g.state.objects[fixo];
    return f && f.zone === 'battlefield' && !f.phasedOut && !exclude.includes(fixo) && !protectionBlocksAttach(g, fixo, auraDef, auraId) ? [fixo] : [];
  }
  const spec = registry.cards.get(auraDef)?.faces[face]?.enchant ?? registry.tokens.get(auraDef)?.enchant; // ficha de Aura (Contract)
  if (!spec) return [];
  const ctx: SCtx = { g, you: controller, source: auraId ?? -1 };
  // "encantar carta de criatura num cemitério" (CR 303.4a): candidatos na zona da especificação
  if (spec.what === 'card') {
    const zona = spec.zone ?? 'graveyard';
    const ids = zona === 'graveyard' || zona === 'hand' || zona === 'library' ? g.state.zones[zona].flat() : g.state.zones[zona];
    return ids.filter((id) => !exclude.includes(id) && (!spec.filter || spec.filter(ctx, { kind: 'obj', id })));
  }
  return g.state.zones.battlefield.filter((id) => !exclude.includes(id) && !g.state.objects[id].phasedOut && (!spec.filter || spec.filter(ctx, { kind: 'obj', id })) && !protectionBlocksAttach(g, id, auraDef, auraId));
}

function protectionBlocksAttach(g: G, target: ObjId, auraDef: string, auraId?: ObjId): boolean {
  const colors = auraId !== undefined && g.state.objects[auraId] ? chars(g, auraId).colors : printedChars(auraDef, 0, 0).colors;
  return kwParams(g, target, 'protection').some((p) => protectionMatches(g, p, { colors, types: printedChars(auraDef, 0, 0).types, id: auraId }));
}

export function protectionMatches(g: G, quality: unknown, src: { colors: Color[]; types: string[]; id?: ObjId }): boolean {
  // proteção com exceção de um objeto ("este efeito não remove esta Aura", Flickering Ward)
  if (quality && typeof quality === 'object' && 'base' in quality) {
    const q = quality as { base: string; exceto?: ObjId };
    if (q.exceto !== undefined && src.id === q.exceto) return false;
    return protectionMatches(g, q.base, src);
  }
  if (typeof quality !== 'string') return false;
  if (quality.startsWith('color:')) return src.colors.includes(quality.slice(6) as Color);
  if (quality === 'creatures') return src.types.includes('Creature');
  return false;
}

export function* putOntoBattlefield(g: G, reqs: EnterReq[], cause: string): Gen<ObjId[]> {
  const s = g.state;
  const results: ObjId[] = [];
  const events: GameEvent[] = [];
  const prepared: { r: EnterReq; ev: EnterEvent; chars: ReturnType<typeof wouldBeChars> }[] = [];
  for (const r of reqs) {
    const wc = wouldBeChars(g, r);
    // instantâneas e feitiços não entram no campo (CR 400.4a)
    if (wc.types.includes('Instant') || wc.types.includes('Sorcery')) continue;
    const fromObj = r.id !== undefined ? g.state.objects[r.id] : null;
    if (r.id !== undefined && !fromObj) continue;
    // ficha ou cópia que já saiu do campo/pilha não volta (CR 111.8, 707.10a)
    if (fromObj && ((fromObj.isToken && fromObj.zone !== 'battlefield') || (fromObj.isCopy && fromObj.zone !== 'stack'))) continue;
    const ev: EnterEvent = {
      obj: r.id ?? -1, controller: r.controller, tapped: !!r.tapped, counters: { ...(r.counters ?? {}) },
      attachTo: r.attachTo ?? null, fromZone: fromObj?.zone ?? 'command', choices: { ...(r.choices ?? {}) },
      copyOf: r.token?.copyOf ?? r.copyOf ?? null, faceDown: r.faceDown, spell: r.spell,
    };
    // Aura que entra sem ser mágica: escolhe o que encantar (CR 303.4f); sem opção, não entra (303.4g)
    if (wc.subtypes.includes('Aura') && !r.faceDown && ev.attachTo === null) {
      const defName = r.token?.copyOf?.def ?? r.token?.def ?? fromObj?.copyOf?.def ?? fromObj!.def;
      const cands = enchantCandidates(g, defName, 0, r.controller, r.id !== undefined ? [r.id] : []);
      if (cands.length === 0) continue;
      const pick = yield* chooseItems(g, r.controller, `Escolha o que ${wc.name} vai encantar`, cands.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
      ev.attachTo = Number(pick[0]);
    }
    // planeswalker entra com marcadores de lealdade (CR 306.5b)
    if (wc.types.includes('Planeswalker') && wc.loyalty !== null) ev.counters.loyalty = (ev.counters.loyalty ?? 0) + wc.loyalty;
    // substituições "ao entrar" do próprio objeto (CR 614.1c, 614.12)
    for (const inst of r.faceDown ? [] : wc.abilities) {
      const def = registry.abilities.get(inst.id);
      if (def?.kind === 'replacement' && (def as ReplacementDef).enters) {
        yield* (def as ReplacementDef).enters!({ g, you: r.controller, source: r.id ?? -1 }, ev);
      }
    }
    // substituições de outros permanentes ("criaturas entram com…")
    for (const h of hooks(g, 'enterModifier')) h.fn(h.ctx, ev, wc);
    prepared.push({ r, ev, chars: wc });
  }
  for (const { r, ev } of prepared) {
    let newId: ObjId;
    let from: ZoneName | 'nowhere' = 'nowhere';
    let card: CardId | null = null;
    let owner = r.controller;
    let token = false;
    if (r.id !== undefined) {
      const o = s.objects[r.id];
      if (!o) continue;
      from = o.zone;
      card = o.card;
      owner = o.owner;
      token = o.isToken;
      newId = moveRaw(g, r.id, 'battlefield', {
        controller: ev.controller, tapped: ev.tapped, counters: ev.counters, attachTo: ev.attachTo, faceDown: !!ev.faceDown, keepCopy: !!o.copyOf,
        face: r.face ?? (o.zone === 'stack' ? o.face : 0),
      });
      const n = s.objects[newId];
      if (r.copyOf) n.copyOf = r.copyOf;
      if (o.zone === 'stack' && o.isCopy) { n.isCopy = false; n.isToken = true; } // CR 608.3f
    } else {
      token = true;
      const n = createObject(g, {
        def: r.token!.def ?? r.token!.copyOf!.def, owner: r.controller, controller: ev.controller, zone: 'battlefield',
        isToken: true, copyOf: r.token!.copyOf ?? null, tapped: ev.tapped, counters: ev.counters, attachedTo: ev.attachTo,
      });
      newId = n.id;
    }
    const n = s.objects[newId];
    n.choices = { ...ev.choices };
    const entraPreparado = ev.choices.prepared === true;
    if (ev.spell) n.data.spell = ev.spell;
    if (r.data) Object.assign(n.data, r.data);
    // efeitos que valem desde a entrada (CR 614.1c, 707.2): aplicados antes dos eventos, então os gatilhos de entrar os veem
    for (const ef of ev.enterEffects ?? []) {
      const dur = ef.duration.kind === 'whileOnBattlefield' ? { kind: 'whileOnBattlefield' as const, obj: newId } : ef.duration;
      addEffect(g, { source: newId, sourceDef: ef.sourceDef, controller: ef.controller, duration: dur, affected: [newId], mods: ef.mods });
    }
    if (ev.attachTo !== null) n.timestamp = newTimestamp(g);
    results.push(newId);
    if (entraPreparado) prepare(g, newId); // "entra preparado" (CR 722.3a)
    events.push({ type: 'zone', obj: newId, old: r.id ?? newId, from, to: 'battlefield', card, owner, controller: ev.controller, cause, token });
    if (r.id === undefined) events.push({ type: 'token', obj: newId, player: ev.controller });
    // entrar com marcadores conta como colocar marcadores (CR 122.6, 122.6a: quem põe é o controlador)
    for (const [kind, amount] of Object.entries(ev.counters)) if (amount > 0) events.push({ type: 'counters', target: { kind: 'obj', id: newId }, kind, amount, by: ev.controller });
    // entra atacando (CR 506.3, 508.4)
    if (r.attacking && s.combat && s.turn.active === ev.controller) {
      s.combat.attackers.push({ id: newId, target: r.attacking, blocked: false, blockers: [], removed: false });
    }
  }
  g.bump();
  emit(g, events);
  return results;
}

// ---------------------------------------------------------------------------
// Preparação (CR 722.3)
// ---------------------------------------------------------------------------
/** o permanente tem um feitiço preparado nos valores copiáveis? (CR 722.2b) */
function temFeiticoPreparado(g: G, id: ObjId): { def: string } | null {
  const o = g.state.objects[id];
  const def = o.copyOf?.def ?? o.def;
  return oracleLayout(def) === 'prepare' ? { def } : null;
}

/**
 * Torna o permanente preparado (CR 722.3a, 722.3c): só se tiver feitiço preparado e ainda não
 * estiver preparado; o controlador cria no exílio uma cópia com as características do feitiço.
 */
export function prepare(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || o.prepared || o.phasedOut) return false;
  const f = temFeiticoPreparado(g, id);
  if (!f) return false;
  o.prepared = true;
  const ctrl = controllerOf(g, id);
  const copia = createObject(g, { def: f.def, owner: ctrl, controller: ctrl, zone: 'exile', isCopy: true, copyOf: { def: f.def, face: 1 }, face: 1 });
  copia.data.preparedBy = id;
  g.log(`${nameOf(g, id)} fica preparado.`, { rule: '722.3' });
  g.bump();
  emit(g, [{ type: 'prepared', obj: id }]);
  return true;
}

/** tira a designação de preparado (CR 722.3b); a cópia no exílio deixa de existir (704.5e) */
export function unprepare(g: G, id: ObjId): void {
  const o = g.state.objects[id];
  if (!o || !o.prepared) return;
  o.prepared = false;
  g.bump();
}

/** cria fichas (CR 111, 701.7) */
export function* createTokens(g: G, player: PlayerId, def: string | { copyOf: CopyValues }, n: number, opts: Omit<EnterReq, 'controller' | 'token' | 'id'> = {}): Gen<ObjId[]> {
  if (n <= 0 || g.state.players[player].left) return [];
  if (typeof def !== 'string') {
    // ficha cópia de instantânea ou feitiço não é criada (CR 111.5)
    const pc = printedChars(def.copyOf.def, def.copyOf.face, player);
    if (pc.types.includes('Instant') || pc.types.includes('Sorcery')) return [];
  }
  const reqs: EnterReq[] = [];
  for (let i = 0; i < n; i++) reqs.push({ ...opts, controller: player, token: typeof def === 'string' ? { def } : { copyOf: def.copyOf } });
  return yield* putOntoBattlefield(g, reqs, 'token');
}

// ---------------------------------------------------------------------------
// Vida (CR 119)
// ---------------------------------------------------------------------------
export function gainLife(g: G, player: PlayerId, amount: number, source: ObjId | null): number {
  const p = g.state.players[player];
  if (amount <= 0 || p.left) return 0;
  for (const h of hooks(g, 'cantGainLife')) if (h.fn(h.ctx, player)) return 0; // CR 119.7
  let n = amount;
  for (const h of hooks(g, 'lifeGainBonus')) n += h.fn(h.ctx, player);
  p.life += n;
  g.bump();
  emit(g, [{ type: 'lifeGain', player, amount: n, source }]);
  return n;
}

export function loseLife(g: G, player: PlayerId, amount: number, source: ObjId | null): number {
  const p = g.state.players[player];
  if (amount <= 0 || p.left) return 0;
  p.life -= amount;
  g.bump();
  emit(g, [{ type: 'lifeLoss', player, amount, source }]);
  return amount;
}

// ---------------------------------------------------------------------------
// Dano (CR 120)
// ---------------------------------------------------------------------------
export interface DamageReq { source: ObjId; target: TargetRef; amount: number; combat: boolean }

function sourceInfo(g: G, id: ObjId) {
  const o = objOrLki(g, id);
  const c = g.state.objects[id] ? chars(g, id) : g.state.lki[id]?.chars;
  return { o, c, controller: g.state.objects[id] ? controllerOf(g, id) : (c?.controller ?? o?.controller ?? 0) };
}

function sourceHas(g: G, id: ObjId, kw: string): boolean {
  if (g.state.objects[id]) return hasKw(g, id, kw);
  return !!g.state.lki[id]?.chars.abilities.some((a) => a.kw === kw); // CR 702.2e, 702.15c
}

/**
 * Causa dano simultâneo (CR 120.4): prevenção, resultados (vida, marcadores, dano marcado),
 * vínculo com a vida, toque mortífero e dano de comandante.
 */
export function dealDamage(g: G, reqs: DamageReq[]): { dealt: number; to: TargetRef; source: ObjId }[] {
  const s = g.state;
  const events: GameEvent[] = [];
  const results: { dealt: number; to: TargetRef; source: ObjId }[] = [];
  const cantPrevent = hooks(g, 'damageCantBePrevented').some((h) => h.fn(h.ctx));
  const lifelinkGains = new Map<ObjId, { player: PlayerId; amount: number }>();
  for (const r of reqs) {
    if (r.amount <= 0) continue; // CR 120.8
    const { c: sc, controller } = sourceInfo(g, r.source);
    if (!sc) continue;
    let amount = r.amount;
    // alvo ainda existe?
    if (r.target.kind === 'obj') {
      const t = s.objects[r.target.id];
      if (!t || t.zone !== 'battlefield' || t.phasedOut) continue;
      const tc = chars(g, r.target.id);
      if (!tc.types.some((x) => x === 'Creature' || x === 'Planeswalker' || x === 'Battle')) continue; // CR 120.1a
    } else if (s.players[r.target.id].left) continue;
    // prevenção (CR 615): proteção (702.16e) e escudos registrados
    if (!cantPrevent) {
      if (r.target.kind === 'obj' && kwParams(g, r.target.id, 'protection').some((q) => protectionMatches(g, q, { colors: sc.colors, types: sc.types }))) amount = 0;
      for (const e of s.effects) for (const m of e.mods) {
        if (m.k !== 'rule' || m.id !== 'rule:preventCombatDamageToPlayer' || amount === 0) continue;
        if (r.combat && r.target.kind === 'player' && e.affectedPlayers?.includes(r.target.id)) {
          const prevented = amount;
          amount = 0;
          (e as unknown as { prevented: number }).prevented = ((e as unknown as { prevented?: number }).prevented ?? 0) + prevented;
        }
      }
    }
    if (amount <= 0) continue;
    results.push({ dealt: amount, to: r.target, source: r.source });
    events.push({ type: 'damage', source: r.source, controller, target: r.target, amount, combat: r.combat });
    const wither = sourceHas(g, r.source, 'wither') || sourceHas(g, r.source, 'infect') || hooks(g, 'damageAsWither').some((h) => h.fn(h.ctx, r.source));
    if (r.target.kind === 'player') {
      const p = s.players[r.target.id];
      p.life -= amount; // CR 120.3a
      events.push({ type: 'lifeLoss', player: r.target.id, amount, source: r.source });
      const so = objOrLki(g, r.source);
      if (r.combat && so && so.card !== null && s.cards[so.card]?.isCommander && isCommanderObjectAt(g, r.source)) {
        const key = String(so.card);
        p.commanderDamage[key] = (p.commanderDamage[key] ?? 0) + amount; // CR 903.10a
      }
    } else {
      const t = s.objects[r.target.id];
      const tc = chars(g, r.target.id);
      if (tc.types.includes('Planeswalker')) {
        const loy = t.counters.loyalty ?? 0;
        const rem = Math.min(loy, amount);
        if (rem > 0) { t.counters.loyalty = loy - rem; events.push({ type: 'countersRemoved', target: r.target, kind: 'loyalty', amount: rem }); } // CR 120.3c
      }
      if (tc.types.includes('Creature')) {
        if (wither) {
          t.counters['-1/-1'] = (t.counters['-1/-1'] ?? 0) + amount; // CR 120.3d
          events.push({ type: 'counters', target: r.target, kind: '-1/-1', amount, by: controller });
        } else t.damage += amount; // CR 120.3e
        if (sourceHas(g, r.source, 'deathtouch')) t.deathtouched = true; // CR 702.2b
      }
    }
    if (sourceHas(g, r.source, 'lifelink')) {
      const prev = lifelinkGains.get(r.source);
      lifelinkGains.set(r.source, { player: controller, amount: (prev?.amount ?? 0) + amount });
    }
  }
  g.bump();
  emit(g, events);
  // vínculo com a vida: um evento de ganho por fonte (CR 702.15b, 702.15e)
  for (const [src, gain] of lifelinkGains) gainLife(g, gain.player, gain.amount, src);
  return results;
}

/** o objeto que causou dano é o comandante (ou a carta designada como tal) — CR 903.3 */
function isCommanderObjectAt(g: G, id: ObjId): boolean {
  const o = objOrLki(g, id);
  if (!o || o.card === null || o.isToken) return false;
  return !!g.state.cards[o.card]?.isCommander;
}

// ---------------------------------------------------------------------------
// Destruir, sacrificar, exilar, devolver
// ---------------------------------------------------------------------------
/** CR 701.8: destruir; indestrutível não é destruído (702.12b) */
export function* destroy(g: G, ids: ObjId[]): Gen<(ObjId | null)[]> {
  const ok = ids.filter((id) => g.state.objects[id]?.zone === 'battlefield' && !hasKw(g, id, 'indestructible'));
  return yield* moveObjects(g, ok.map((id) => ({ id, to: 'graveyard' as ZoneName })), 'destroy');
}

/** CR 701.21: sacrificar (só permanentes que o jogador controla) */
export function* sacrifice(g: G, ids: ObjId[]): Gen<(ObjId | null)[]> {
  const ok = ids.filter((id) => g.state.objects[id]?.zone === 'battlefield');
  return yield* moveObjects(g, ok.map((id) => ({ id, to: 'graveyard' as ZoneName })), 'sacrifice');
}

export function* exile(g: G, ids: ObjId[], opts: { faceDown?: boolean; linkTo?: { obj: ObjId; key: string } } = {}): Gen<(ObjId | null)[]> {
  const res = yield* moveObjects(g, ids.map((id) => ({ id, to: 'exile' as ZoneName, faceDown: opts.faceDown })), 'exile');
  if (opts.linkTo) {
    const holder = g.state.objects[opts.linkTo.obj];
    if (holder) {
      holder.linked[opts.linkTo.key] = [...(holder.linked[opts.linkTo.key] ?? []), ...res.filter((x): x is ObjId => x !== null && g.state.objects[x]?.zone === 'exile')];
      g.bump();
    }
  }
  return res;
}

export function* returnToHand(g: G, ids: ObjId[]): Gen<(ObjId | null)[]> {
  return yield* moveObjects(g, ids.map((id) => ({ id, to: 'hand' as ZoneName })), 'bounce');
}

// ---------------------------------------------------------------------------
// Marcadores (CR 122)
// ---------------------------------------------------------------------------
export function addCounters(g: G, target: TargetRef, kind: string, n: number, by: PlayerId | null): number {
  if (n <= 0) return 0;
  if (target.kind === 'player') {
    const p = g.state.players[target.id];
    if (p.left) return 0;
    p.counters[kind] = (p.counters[kind] ?? 0) + n;
  } else {
    const o = g.state.objects[target.id];
    if (!o || (o.zone !== 'battlefield' && o.zone !== 'exile')) return 0; // CR 122.1: marcadores de tempo no exílio (suspender)
    o.counters[kind] = (o.counters[kind] ?? 0) + n;
  }
  g.bump();
  emit(g, [{ type: 'counters', target, kind, amount: n, by }]);
  return n;
}

export function removeCounters(g: G, target: TargetRef, kind: string, n: number): number {
  const bag = target.kind === 'player' ? g.state.players[target.id].counters : g.state.objects[target.id]?.counters;
  if (!bag) return 0;
  const have = bag[kind] ?? 0;
  const rem = Math.min(have, n);
  if (rem <= 0) return 0;
  if (have - rem <= 0) delete bag[kind];
  else bag[kind] = have - rem;
  g.bump();
  emit(g, [{ type: 'countersRemoved', target, kind, amount: rem }]);
  return rem;
}

/** CR 701.68: blight N — pôr N marcadores -1/-1 numa criatura que você controla */
export function* blight(g: G, player: PlayerId, n: number, optional = false): Gen<ObjId | null> {
  if (n <= 0) return null;
  const mine = g.state.zones.battlefield.filter((id) => isCreature(g, id) && controllerOf(g, id) === player && !g.state.objects[id].phasedOut);
  if (mine.length === 0) return null; // CR 701.68b
  const pick = yield* chooseItems(g, player, `Escolha uma criatura sua para receber ${n} marcador(es) -1/-1 (blight ${n})`, mine.map((id) => objItem(g, id, nameOf(g, id))), optional ? 0 : 1, 1);
  if (pick.length === 0) return null;
  const id = Number(pick[0]);
  addCounters(g, { kind: 'obj', id }, '-1/-1', n, player);
  emit(g, [{ type: 'blight', player, creature: id, n }]);
  return id;
}

// ---------------------------------------------------------------------------
// Virar e desvirar (CR 701.26)
// ---------------------------------------------------------------------------
export function tap(g: G, id: ObjId, forMana = false): boolean {
  const o = g.state.objects[id];
  if (!o || o.tapped) return false;
  o.tapped = true;
  g.bump();
  emit(g, [{ type: 'tap', obj: id, forMana }]);
  return true;
}

export function untap(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  if (!o || !o.tapped) return false;
  o.tapped = false;
  g.bump();
  emit(g, [{ type: 'untap', obj: id }]);
  return true;
}

// ---------------------------------------------------------------------------
// Mana
// ---------------------------------------------------------------------------
export function addMana(g: G, player: PlayerId, types: ManaType[], extra: Omit<ManaUnit, 'type'> = { source: null }): void {
  const pool = g.state.players[player].manaPool;
  for (const t of types) pool.push({ ...extra, type: t });
  g.bump();
}

// ---------------------------------------------------------------------------
// Grimório: comprar, moer, embaralhar, buscar, vidência, vigiar
// ---------------------------------------------------------------------------
export function* draw(g: G, player: PlayerId, n = 1): Gen<ObjId[]> {
  const out: ObjId[] = [];
  const p = g.state.players[player];
  for (let i = 0; i < n; i++) { // CR 121.2: uma de cada vez
    if (p.left) break;
    const lib = g.state.zones.library[player];
    if (lib.length === 0) { p.drewFromEmpty = true; g.bump(); continue; } // CR 121.4
    const top = lib[0];
    const before = g.state.turnStats[player].cardsDrawn;
    const [newId] = yield* moveObjects(g, [{ id: top, to: 'hand' }], 'draw');
    if (newId !== null && g.state.objects[newId]) {
      out.push(newId);
      emit(g, [{ type: 'draw', player, obj: newId, nth: before + 1 }]);
    }
  }
  return out;
}

export function* mill(g: G, player: PlayerId, n: number): Gen<ObjId[]> {
  const lib = g.state.zones.library[player];
  const ids = lib.slice(0, Math.min(n, lib.length)); // CR 701.17b
  if (ids.length === 0) return [];
  const res = yield* moveObjects(g, ids.map((id) => ({ id, to: 'graveyard' as ZoneName })), 'mill');
  const out = res.filter((x): x is ObjId => x !== null);
  emit(g, [{ type: 'mill', player, objs: out }]);
  return out;
}

export function shuffleLibrary(g: G, player: PlayerId): void {
  shuffleArr(g.state.rng, g.state.zones.library[player]);
  // cartas reveladas que são reordenadas viram objetos novos (CR 701.20d): marcamos como ocultas
  for (const id of g.state.zones.library[player]) g.state.objects[id].visibleTo = null;
  g.bump();
  emit(g, [{ type: 'shuffle', player }]);
}

/** busca no grimório (CR 701.23): o jogador vê o grimório e pode não achar cartas com qualidade */
export function* searchLibrary(g: G, player: PlayerId, library: PlayerId, opts: { filter?: (id: ObjId) => boolean; max: number; min?: number; prompt: string }): Gen<ObjId[]> {
  const lib = g.state.zones.library[library];
  emit(g, [{ type: 'search', player, library }]);
  const items = lib.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def }, disabled: opts.filter ? !opts.filter(id) : false }));
  if (items.every((i) => i.disabled)) {
    yield* chooseItems(g, player, `${opts.prompt} (nenhuma carta serve)`, items, 0, 0);
    return [];
  }
  const max = Math.min(opts.max, items.filter((i) => !i.disabled).length);
  const ids = yield* chooseItems(g, player, opts.prompt, items, opts.min ?? 0, max);
  return ids.map(Number);
}

/** vidência (CR 701.22) e vigiar (CR 701.25) */
export function* lookAndArrange(g: G, player: PlayerId, n: number, mode: 'scry' | 'surveil'): Gen<void> {
  if (n <= 0) return; // CR 701.22b, 701.25c
  const lib = g.state.zones.library[player];
  const top = lib.slice(0, Math.min(n, lib.length));
  if (top.length > 0) {
    const a = yield* ask<Extract<Answer, { kind: 'arrange' }>>(g, {
      kind: 'arrange', player,
      prompt: mode === 'scry' ? `Vidência ${n}: escolha o que fica no topo (em ordem) e o que vai para o fundo` : `Vigiar ${n}: escolha o que vai para o cemitério e a ordem do topo`,
      items: top.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def } })),
      destinations: mode === 'scry' ? ['top', 'bottom'] : ['top', 'graveyard'],
    });
    const toTop = a.order.filter((id) => a.placement[id] === 'top').map(Number);
    const toBottom = a.order.filter((id) => a.placement[id] === 'bottom').map(Number);
    const toGy = a.order.filter((id) => a.placement[id] === 'graveyard').map(Number);
    const rest = lib.filter((id) => !top.includes(id));
    g.state.zones.library[player] = [...toTop, ...rest, ...toBottom];
    g.bump();
    if (toGy.length) yield* moveObjects(g, toGy.map((id) => ({ id, to: 'graveyard' as ZoneName })), 'surveil');
  }
  emit(g, [mode === 'scry' ? { type: 'scry', player, n } : { type: 'surveil', player, n }]);
}

export function* discard(g: G, player: PlayerId, n: number, opts: { random?: boolean; chooser?: PlayerId; filter?: (id: ObjId) => boolean; upTo?: boolean } = {}): Gen<ObjId[]> {
  const hand = g.state.zones.hand[player].filter((id) => !opts.filter || opts.filter(id));
  if (hand.length === 0 || n <= 0) return [];
  let chosen: ObjId[];
  if (opts.random) {
    const copy = [...hand];
    shuffleArr(g.state.rng, copy);
    chosen = copy.slice(0, n);
  } else if (!opts.upTo && hand.length <= n) chosen = hand;
  else {
    const who = opts.chooser ?? player;
    const ids = yield* chooseItems(g, who, `Descarte ${n === 1 ? 'uma carta' : `${n} cartas`}`, hand.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def } })), opts.upTo ? 0 : Math.min(n, hand.length), Math.min(n, hand.length));
    chosen = ids.map(Number);
  }
  const res = yield* moveObjects(g, chosen.map((id) => ({ id, to: 'graveyard' as ZoneName })), 'discard');
  return res.filter((x): x is ObjId => x !== null);
}

// ---------------------------------------------------------------------------
// Controle, anexar, goad, monarca
// ---------------------------------------------------------------------------
export function gainControl(g: G, id: ObjId, player: PlayerId, duration: Duration, source: ObjId): void {
  const o = g.state.objects[id];
  if (!o || g.state.players[player].left) return; // CR 800.4b
  const before = controllerOf(g, id);
  addEffect(g, { source, sourceDef: '', controller: player, duration, affected: [id], mods: [{ k: 'control', player }] });
  if (before !== player) {
    o.controlledSince = g.state.turn.number; // CR 302.6
    removeFromCombat(g, id); // CR 506.4
    g.bump();
    emit(g, [{ type: 'controlChange', obj: id, from: before, to: player }]);
  }
}

export function attach(g: G, attachment: ObjId, to: ObjId): boolean {
  const a = g.state.objects[attachment];
  const t = g.state.objects[to];
  if (!a || !t || a.zone !== 'battlefield' || t.zone !== 'battlefield' || attachment === to) return false;
  const ac = chars(g, attachment);
  if (ac.subtypes.includes('Equipment') && !isCreature(g, to)) return false; // CR 301.5
  if (ac.subtypes.includes('Aura')) {
    const def = a.copyOf?.def ?? a.def;
    if (!enchantCandidates(g, def, 0, controllerOf(g, attachment), [], attachment).includes(to)) return false; // CR 303.4j
  }
  if (a.attachedTo === to) return true;
  a.attachedTo = to;
  a.timestamp = newTimestamp(g); // CR 613.7e
  g.bump();
  emit(g, [{ type: 'attach', obj: attachment, to }]);
  return true;
}

/** CR 701.15: goad até o próximo turno de quem goadou */
export function goad(g: G, id: ObjId, player: PlayerId): void {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield') return;
  if (o.goadedBy.some((x) => x.player === player)) return; // CR 701.15d
  o.goadedBy.push({ player, untilTurnOf: player, sinceTurn: g.state.turn.number });
  g.bump();
}

export function becomeMonarch(g: G, player: PlayerId): void {
  if (g.state.players[player].left) return;
  g.state.monarch = player;
  g.bump();
  g.log(`${g.state.players[player].name} se torna o monarca.`, { rule: '725' });
  emit(g, [{ type: 'monarch', player }]);
}

// ---------------------------------------------------------------------------
// Utilidades para efeitos
// ---------------------------------------------------------------------------
export function controlledBy(g: G, player: PlayerId, filter: (id: ObjId) => boolean = () => true): ObjId[] {
  return g.state.zones.battlefield.filter((id) => !g.state.objects[id].phasedOut && controllerOf(g, id) === player && filter(id));
}

export function creaturesOf(g: G, player: PlayerId): ObjId[] {
  return controlledBy(g, player, (id) => isCreature(g, id));
}

export function allCreatures(g: G): ObjId[] {
  return g.state.zones.battlefield.filter((id) => !g.state.objects[id].phasedOut && isCreature(g, id));
}

export function permanentsMatching(g: G, f: (id: ObjId) => boolean): ObjId[] {
  return g.state.zones.battlefield.filter((id) => !g.state.objects[id].phasedOut && f(id));
}

export { recordLki, destroyObject, colorsOf, isType, toughness, abilityDefs };
export type { TargetSpec };
