// Combate (CR 506-511) no modo de atacar vários jogadores (CR 802), padrão do Commander (903.2).

import { dealDamage, removeFromCombat, tap, type DamageReq } from './actions.ts';
import { ask } from './ask.ts';
import { chars, controllerOf, hasKw, hooks, isCreature, isType, kwParams, nameOf, power, toughness } from './chars.ts';
import { summoningSick, payMana } from './costs.ts';
import type { Gen } from './defs.ts';
import type { G } from './game-context.ts';
import { protectionMatches } from './actions.ts';
import { emit } from './triggers.ts';
import type { Answer, CombatState, ObjId, PlayerId, TargetRef } from './types.ts';

export function newCombat(): CombatState {
  return { attackers: [], blockers: [], firstStrikers: [], firstStrikeStep: false, declared: false };
}

// ---------------------------------------------------------------------------
// Atacantes (CR 508, 802.3)
// ---------------------------------------------------------------------------
function attackTargetsFor(g: G, attacker: ObjId, player: PlayerId): TargetRef[] {
  const out: TargetRef[] = [];
  for (const opp of g.opponents(player)) {
    out.push({ kind: 'player', id: opp });
    for (const id of g.state.zones.battlefield) {
      const o = g.state.objects[id];
      if (!o.phasedOut && isType(g, id, 'Planeswalker') && controllerOf(g, id) === opp) out.push({ kind: 'obj', id });
    }
  }
  return out.filter((t) => canAttackTarget(g, attacker, t));
}

function canAttackTarget(g: G, attacker: ObjId, t: TargetRef): boolean {
  for (const h of hooks(g, 'canAttack')) if (!h.fn(h.ctx, attacker, t)) return false;
  if (t.kind === 'player') for (const h of hooks(g, 'canAttackPlayer')) if (!h.fn(h.ctx, attacker, t.id)) return false;
  if (hasKw(g, attacker, 'defender') && !hooks(g, 'canAttackWithDefender').some((h) => h.fn(h.ctx, attacker, t))) return false; // CR 702.3b
  return true;
}

/** criaturas que podem atacar, com os alvos possíveis (CR 508.1a-b) */
export function attackCandidates(g: G, player: PlayerId): { obj: ObjId; targets: TargetRef[] }[] {
  const out: { obj: ObjId; targets: TargetRef[] }[] = [];
  for (const id of g.state.zones.battlefield) {
    const o = g.state.objects[id];
    if (o.phasedOut || o.tapped || controllerOf(g, id) !== player || !isCreature(g, id)) continue;
    if (summoningSick(g, id)) continue; // CR 302.6
    if (isType(g, id, 'Battle')) continue;
    const targets = attackTargetsFor(g, id, player);
    if (targets.length) out.push({ obj: id, targets });
  }
  return out;
}

/** custo para atacar (Ghostly Prison) em mana genérica */
function attackCostFor(g: G, attacker: ObjId, t: TargetRef): number {
  let n = 0;
  for (const h of hooks(g, 'attackCost')) n += h.fn(h.ctx, attacker, t);
  return n;
}

/**
 * Exigências de ataque de uma criatura, cada uma como um predicado sobre o alvo escolhido
 * (null = não ataca). Goad cria duas: atacar se puder e atacar outro jogador que não o
 * que goadou, se puder (CR 701.15b). "Ataca este turno se puder" cria uma; quando nomeia
 * um oponente, ela só é cumprida atacando esse oponente.
 */
function requirements(g: G, id: ObjId): ((t: TargetRef | null) => boolean)[] {
  const o = g.state.objects[id];
  const reqs: ((t: TargetRef | null) => boolean)[] = [];
  const attacks = (t: TargetRef | null) => t !== null;
  const notPlayer = (p: PlayerId) => (t: TargetRef | null) => t !== null && t.kind === 'player' && t.id !== p;
  for (const gd of o.goadedBy) { reqs.push(attacks); reqs.push(notPlayer(gd.player)); }
  for (const h of hooks(g, 'goads')) if (h.fn(h.ctx, id)) { reqs.push(attacks); reqs.push(notPlayer(h.ctx.you)); }
  for (const e of g.state.effects) for (const m of e.mods) {
    if (m.k !== 'rule' || !e.affected?.includes(id)) continue;
    if (m.id === 'rule:attacksIfAble') {
      const target = m.params?.player as PlayerId | undefined;
      reqs.push(target === undefined ? attacks : (t) => t !== null && t.kind === 'player' && t.id === target);
    }
  }
  return reqs;
}

function obeyed(reqs: ((t: TargetRef | null) => boolean)[], target: TargetRef | null): number {
  return reqs.reduce((n, r) => n + (r(target) ? 1 : 0), 0);
}

/** máximo de exigências que a criatura pode cumprir, sem pagar custos (CR 508.1d) */
function maxObeyed(g: G, id: ObjId, targets: TargetRef[]): number {
  const reqs = requirements(g, id);
  if (reqs.length === 0) return 0;
  const free = targets.filter((t) => attackCostFor(g, id, t) === 0);
  let best = 0;
  for (const t of free) best = Math.max(best, obeyed(reqs, t));
  return best;
}

export function validateAttack(g: G, player: PlayerId, attacks: [ObjId, TargetRef][]): string | null {
  const cands = attackCandidates(g, player);
  const seen = new Set<ObjId>();
  for (const [id, t] of attacks) {
    if (seen.has(id)) return 'Criatura declarada duas vezes';
    seen.add(id);
    const c = cands.find((x) => x.obj === id);
    if (!c) return `${nameOf(g, id)} não pode atacar`;
    if (!c.targets.some((x) => x.kind === t.kind && x.id === t.id)) return `${nameOf(g, id)} não pode atacar esse alvo`;
  }
  // exigências (CR 508.1d)
  for (const c of cands) {
    const max = maxObeyed(g, c.obj, c.targets);
    if (max === 0) continue;
    const decl = attacks.find(([id]) => id === c.obj);
    const got = obeyed(requirements(g, c.obj), decl ? decl[1] : null);
    if (got < max) return `${nameOf(g, c.obj)} precisa atacar${c.obj && g.state.objects[c.obj].goadedBy.length ? ' um jogador que não o goadou' : ''} se puder (CR 508.1d)`;
  }
  return null;
}

export function* declareAttackers(g: G): Gen<void> {
  const s = g.state;
  const player = s.turn.active;
  const combat = s.combat!;
  const cands = attackCandidates(g, player);
  let attacks: [ObjId, TargetRef][] = [];
  if (cands.length > 0) {
    for (;;) {
      const a = yield* ask<Extract<Answer, { kind: 'attackers' }>>(g, {
        kind: 'attackers', player, prompt: 'Declare os atacantes', candidates: cands.map((c) => ({ obj: c.obj, targets: c.targets })),
      }, (ans) => validateAttack(g, player, ans.attacks));
      attacks = a.attacks;
      // custos para atacar (CR 508.1h-j)
      const total = attacks.reduce((n, [id, t]) => n + attackCostFor(g, id, t), 0);
      if (total > 0) {
        const paid = yield* payMana(g, player, [{ k: 'generic', n: total }], { purpose: { kind: 'effect' }, canCancel: true, label: 'atacar' });
        if (paid === null) continue;
      }
      break;
    }
  }
  combat.declared = true;
  for (const [id, target] of attacks) {
    if (!hasKw(g, id, 'vigilance')) tap(g, id); // CR 508.1f, 702.20b
    combat.attackers.push({ id, target, blocked: false, blockers: [], removed: false });
  }
  if (attacks.length) {
    const names = attacks.map(([id, t]) => `${nameOf(g, id)} → ${t.kind === 'player' ? s.players[t.id].name : nameOf(g, t.id)}`).join('; ');
    g.log(`${s.players[player].name} ataca: ${names}.`, { rule: '508.1' });
  } else g.log(`${s.players[player].name} não ataca.`, { rule: '508.1' });
  g.bump();
  emit(g, [{ type: 'attackers', player, attackers: attacks.map(([obj, target]) => ({ obj, target })) }]);
}

// ---------------------------------------------------------------------------
// Bloqueadores (CR 509, 802.4)
// ---------------------------------------------------------------------------
function defendingPlayerOf(g: G, t: TargetRef): PlayerId {
  return t.kind === 'player' ? t.id : controllerOf(g, t.id);
}

/** pode `blocker` bloquear `attacker`? (restrições individuais: evasão, proteção etc.) */
export function canBlock(g: G, blocker: ObjId, attacker: ObjId): boolean {
  const bc = chars(g, blocker);
  if (hasKw(g, attacker, 'flying') && !hasKw(g, blocker, 'flying') && !hasKw(g, blocker, 'reach')) return false; // CR 702.9b
  if (hasKw(g, attacker, 'shadow') && !hasKw(g, blocker, 'shadow')) return false; // CR 702.28b
  if (hasKw(g, blocker, 'shadow') && !hasKw(g, attacker, 'shadow')) return false;
  if (hasKw(g, attacker, 'skulk') && power(g, blocker) > power(g, attacker)) return false; // CR 702.118b
  if (kwParams(g, attacker, 'protection').some((q) => protectionMatches(g, q, { colors: bc.colors, types: bc.types }))) return false; // CR 702.16f
  if (hasKw(g, blocker, 'decayed') || hasKw(g, blocker, 'cantBlock')) return false; // CR 702.147a
  if (hasKw(g, attacker, 'unblockable')) return false;
  for (const e of g.state.effects) for (const m of e.mods) {
    if (m.k === 'rule' && m.id === 'rule:cantBeBlocked' && e.affected?.includes(attacker)) return false;
    if (m.k === 'rule' && m.id === 'rule:cantBlock' && e.affected?.includes(blocker)) return false;
  }
  for (const h of hooks(g, 'canBlock')) if (!h.fn(h.ctx, blocker, attacker)) return false;
  for (const h of hooks(g, 'canBeBlockedBy')) if (!h.fn(h.ctx, attacker, blocker)) return false;
  return true;
}

export function blockCandidates(g: G, defender: PlayerId): { obj: ObjId; canBlock: ObjId[] }[] {
  const s = g.state;
  const combat = s.combat!;
  const attackingMe = combat.attackers.filter((a) => !a.removed && s.objects[a.id] && defendingPlayerOf(g, a.target) === defender).map((a) => a.id);
  const out: { obj: ObjId; canBlock: ObjId[] }[] = [];
  for (const id of s.zones.battlefield) {
    const o = s.objects[id];
    if (o.phasedOut || o.tapped || controllerOf(g, id) !== defender || !isCreature(g, id) || isType(g, id, 'Battle')) continue;
    const can = attackingMe.filter((a) => canBlock(g, id, a));
    if (can.length) out.push({ obj: id, canBlock: can });
  }
  return out;
}

export function validateBlocks(g: G, defender: PlayerId, blocks: [ObjId, ObjId][]): string | null {
  const cands = blockCandidates(g, defender);
  const seen = new Set<ObjId>();
  for (const [b, a] of blocks) {
    if (seen.has(b)) return 'Cada criatura bloqueia só uma atacante';
    seen.add(b);
    const c = cands.find((x) => x.obj === b);
    if (!c || !c.canBlock.includes(a)) return `${nameOf(g, b)} não pode bloquear ${nameOf(g, a)}`;
  }
  // menace: só pode ser bloqueada por duas ou mais (CR 702.111b)
  const count = new Map<ObjId, number>();
  for (const [, a] of blocks) count.set(a, (count.get(a) ?? 0) + 1);
  for (const [a, n] of count) if (n === 1 && hasKw(g, a, 'menace')) return `${nameOf(g, a)} tem menace: precisa de dois ou mais bloqueadores`;
  return null;
}

export function* declareBlockers(g: G): Gen<void> {
  const s = g.state;
  const combat = s.combat!;
  const defenders = g.apnap().filter((p) => combat.attackers.some((a) => !a.removed && defendingPlayerOf(g, a.target) === p));
  const all: [ObjId, ObjId][] = [];
  // CR 802.4: cada defensor, em ordem APNAP, declara seus bloqueios
  for (const d of defenders) {
    const cands = blockCandidates(g, d);
    if (cands.length === 0) continue;
    const attackers = combat.attackers.filter((a) => !a.removed && defendingPlayerOf(g, a.target) === d).map((a) => a.id);
    const a = yield* ask<Extract<Answer, { kind: 'blockers' }>>(g, {
      kind: 'blockers', player: d, prompt: 'Declare os bloqueadores', candidates: cands, attackers,
    }, (ans) => validateBlocks(g, d, ans.blocks));
    all.push(...a.blocks);
  }
  for (const [b, a] of all) {
    combat.blockers.push({ id: b, blocking: [a] });
    const at = combat.attackers.find((x) => x.id === a)!;
    at.blocked = true;
    at.blockers.push(b);
  }
  if (all.length) g.log(`Bloqueios: ${all.map(([b, a]) => `${nameOf(g, b)} bloqueia ${nameOf(g, a)}`).join('; ')}.`, { rule: '509.1' });
  g.bump();
  emit(g, [{ type: 'blockers', blocks: all }]);
}

// ---------------------------------------------------------------------------
// Dano de combate (CR 510, 702.4, 702.7, 702.19)
// ---------------------------------------------------------------------------
function assignsByToughness(g: G, id: ObjId): boolean {
  return hooks(g, 'assignsByToughness').some((h) => h.fn(h.ctx, id)) ||
    g.state.effects.some((e) => e.affected?.includes(id) && e.mods.some((m) => m.k === 'rule' && m.id === 'rule:assignsByToughness'));
}

export function combatDamageAmount(g: G, id: ObjId): number {
  return Math.max(0, assignsByToughness(g, id) ? toughness(g, id) : power(g, id)); // CR 510.1a
}

function hasFirst(g: G, id: ObjId): boolean {
  return hasKw(g, id, 'first strike') || hasKw(g, id, 'double strike');
}

/** há criatura com primeiro golpe ou golpe duplo no início da etapa de dano? (CR 510.4) */
export function needsFirstStrikeStep(g: G): boolean {
  const c = g.state.combat;
  if (!c) return false;
  const ids = [...c.attackers.filter((a) => !a.removed).map((a) => a.id), ...c.blockers.map((b) => b.id)];
  return ids.some((id) => g.state.objects[id] && hasFirst(g, id));
}

function lethalFor(g: G, blocker: ObjId, attacker: ObjId, already: number): number {
  if (hasKw(g, attacker, 'deathtouch')) return already > 0 ? 0 : 1; // CR 702.2c
  return Math.max(0, toughness(g, blocker) - g.state.objects[blocker].damage - already);
}

export function* combatDamage(g: G, first: boolean): Gen<void> {
  const s = g.state;
  const combat = s.combat!;
  const dealsNow = (id: ObjId): boolean => {
    if (!s.objects[id] || s.objects[id].phasedOut) return false;
    if (first) return hasFirst(g, id);
    if (!combat.firstStrikeStep) return true;
    return !combat.firstStrikers.includes(id) || hasKw(g, id, 'double strike'); // CR 510.4
  };
  const reqs: DamageReq[] = [];
  const assigned = new Map<ObjId, number>();
  // atacantes, em ordem APNAP (CR 802.5): o jogador ativo atribui primeiro
  for (const at of combat.attackers) {
    if (at.removed || !dealsNow(at.id)) continue;
    const amount = combatDamageAmount(g, at.id);
    if (amount <= 0) continue;
    const trample = hasKw(g, at.id, 'trample');
    const blockers = at.blockers.filter((b) => s.objects[b] && s.objects[b].zone === 'battlefield');
    const targetOk = at.target.kind === 'player' ? !s.players[at.target.id].left : (!!s.objects[at.target.id] && isType(g, at.target.id, 'Planeswalker'));
    if (!at.blocked) {
      if (targetOk) reqs.push({ source: at.id, target: at.target, amount, combat: true }); // CR 510.1b
      continue;
    }
    if (blockers.length === 0) {
      if (trample && targetOk) reqs.push({ source: at.id, target: at.target, amount, combat: true }); // CR 702.19d
      continue;
    }
    if (blockers.length === 1 && !trample) {
      reqs.push({ source: at.id, target: { kind: 'obj', id: blockers[0] }, amount, combat: true });
      assigned.set(blockers[0], (assigned.get(blockers[0]) ?? 0) + amount);
      continue;
    }
    const recipients: TargetRef[] = blockers.map((b) => ({ kind: 'obj' as const, id: b }));
    if (trample && targetOk) recipients.push(at.target);
    const lethal = blockers.map((b) => lethalFor(g, b, at.id, assigned.get(b) ?? 0));
    if (trample && targetOk) lethal.push(0);
    const a = yield* ask<Extract<Answer, { kind: 'damage' }>>(g, {
      kind: 'damage', player: s.turn.active, prompt: `Distribua ${amount} de dano de ${nameOf(g, at.id)}`,
      attacker: at.id, amount, recipients, lethal, trample: trample && targetOk,
    }, (ans) => {
      if (ans.assign.reduce((x, y) => x + y, 0) !== amount) return `Atribua exatamente ${amount}`;
      if (trample && targetOk) {
        const toPlayer = ans.assign[ans.assign.length - 1];
        if (toPlayer > 0 && blockers.some((_, i) => ans.assign[i] < lethal[i])) return 'Com atropelar, só sobra dano para o jogador depois de dano letal em todos os bloqueadores (CR 702.19b)';
      }
      return null;
    });
    a.assign.forEach((n, i) => {
      if (n <= 0) return;
      reqs.push({ source: at.id, target: recipients[i], amount: n, combat: true });
      if (recipients[i].kind === 'obj') assigned.set(recipients[i].id, (assigned.get(recipients[i].id) ?? 0) + n);
    });
  }
  // bloqueadores (CR 510.1d)
  for (const b of combat.blockers) {
    if (!dealsNow(b.id)) continue;
    const amount = combatDamageAmount(g, b.id);
    if (amount <= 0) continue;
    const target = b.blocking.find((a) => s.objects[a] && !combat.attackers.find((x) => x.id === a)?.removed);
    if (target === undefined) continue;
    reqs.push({ source: b.id, target: { kind: 'obj', id: target }, amount, combat: true });
  }
  if (first) {
    combat.firstStrikers = [...combat.attackers.filter((a) => !a.removed && dealsNow(a.id)).map((a) => a.id), ...combat.blockers.filter((b) => dealsNow(b.id)).map((b) => b.id)];
  }
  dealDamage(g, reqs); // CR 510.2: simultâneo
  const dealt = reqs.filter((r) => r.target.kind === 'player');
  if (reqs.length) g.log(`Dano de combate: ${reqs.map((r) => `${nameOf(g, r.source)} causa ${r.amount} a ${r.target.kind === 'player' ? s.players[r.target.id].name : nameOf(g, r.target.id)}`).join('; ')}.`, { rule: '510.2' });
  void dealt;
}

export function endCombat(g: G): void {
  const s = g.state;
  // CR 511.3 e 500.5a: todos saem do combate; efeitos "até o fim do combate" terminam
  s.combat = null;
  s.effects = s.effects.filter((e) => e.duration.kind !== 'endOfCombat');
  g.bump();
}

export { removeFromCombat };
