// Ações possíveis com prioridade (CR 117.1) e sua execução.

import { putOntoBattlefield } from './actions.ts';
import { abilityDefs, chars, controllerOf, hasKw, hooks, nameOf } from './chars.ts';
import { activateManaAbility, canAfford, canPayParts, manaOptions, manaPart } from './costs.ts';
import { cardDef, type ActivatedDef, type CastPermission, type Gen, type SCtx } from './defs.ts';
import type { G } from './game-context.ts';
import { formatCost, reduceGeneric } from './mana.ts';
import { manifestFaceUpCost, turnFaceUp } from './mecanicas.ts';
import { activateAbility, candidateTargets, canActivate, castSpell, chooseModes, spellTargetSpecs, totalSpellCost, faceDefOf, type CastMethod } from './stack.ts';
import type { ObjId, PlayerId, PriorityAction, ZoneName } from './types.ts';

export function isMainPhase(g: G): boolean {
  return g.state.turn.step === 'main1' || g.state.turn.step === 'main2';
}

/** CR 117.1a, 307.5: tempo de feitiço */
export function sorceryTiming(g: G, p: PlayerId): boolean {
  return isMainPhase(g) && g.state.turn.active === p && g.state.zones.stack.length === 0;
}

/** permissões de jogar/conjurar de outras zonas (efeitos resolvidos e estáticas) */
export function permissionsFor(g: G, p: PlayerId, card: ObjId): CastPermission[] {
  const out: CastPermission[] = [];
  for (const e of g.state.effects) for (const m of e.mods) {
    if (m.k !== 'rule' || m.id !== 'rule:mayPlay') continue;
    const prm = m.params as { objs: ObjId[]; player: PlayerId; free?: boolean; anyType?: boolean; key?: string; bottomInstead?: boolean; once?: boolean; spellsOnly?: boolean } | undefined;
    if (!prm || prm.player !== p || !prm.objs.includes(card)) continue;
    // "conjure uma mágica dentre elas": a permissão acaba ao ser usada (Locke)
    const onUse = prm.once ? (c: { g: G }) => { c.g.state.effects = c.g.state.effects.filter((x) => x.id !== e.id); c.g.bump(); } : undefined;
    out.push({ key: prm.key ?? `eff${e.id}`, label: 'permissão', free: prm.free, anyType: prm.anyType, land: !prm.spellsOnly, bottomInstead: prm.bottomInstead, onUse });
  }
  for (const h of hooks(g, 'mayPlayFrom')) {
    const r = h.fn(h.ctx, p, card);
    if (r) out.push(r);
  }
  return out;
}

interface CastOption { obj: ObjId; method: CastMethod }

/** maneiras de conjurar cada carta agora (zona e custo), sem checar o pagamento */
export function castOptions(g: G, p: PlayerId): CastOption[] {
  const s = g.state;
  const out: CastOption[] = [];
  const consider = (id: ObjId, zone: ZoneName) => {
    const o = s.objects[id];
    const c = chars(g, id);
    if (c.types.includes('Land')) return; // CR 305.9
    const f = faceDefOf(o);
    if (zone === 'hand') {
      out.push({ obj: id, method: { key: 'hand', label: 'conjurar', zone } });
      for (const alt of f?.altCosts ?? []) if (alt.zone === 'hand') out.push({ obj: id, method: { key: alt.key, label: alt.label, zone, alt } });
    } else if (zone === 'command') {
      if (o.owner === p && o.card !== null && s.cards[o.card].isCommander) out.push({ obj: id, method: { key: 'command', label: 'conjurar da zona de comando', zone } });
    } else {
      if (zone === 'graveyard' && o.owner === p) for (const alt of f?.altCosts ?? []) if (alt.zone === 'graveyard' && (!alt.condition || alt.condition({ g, you: p, source: id }))) out.push({ obj: id, method: { key: alt.key, label: alt.label, zone, alt } });
      if (zone === 'exile' && o.isCopy && o.data.preparedBy !== undefined) {
        const holder = s.objects[o.data.preparedBy as ObjId];
        if (holder && holder.zone === 'battlefield' && holder.prepared && controllerOf(g, holder.id) === p) out.push({ obj: id, method: { key: 'prepared', label: 'conjurar a cópia preparada', zone } });
      }
      for (const prm of permissionsFor(g, p, id)) {
        if (prm.filter && !prm.filter({ g, you: p, source: id }, id)) continue;
        out.push({ obj: id, method: { key: `perm:${prm.key}`, label: prm.label, zone, permission: prm } });
      }
    }
  };
  for (const id of s.zones.hand[p]) consider(id, 'hand');
  for (const id of s.zones.command) consider(id, 'command');
  for (const id of s.zones.graveyard[p]) consider(id, 'graveyard');
  for (const pp of g.playersInGame()) if (pp !== p) for (const id of s.zones.graveyard[pp]) if (permissionsFor(g, p, id).length) consider(id, 'graveyard');
  for (const id of s.zones.exile) consider(id, 'exile');
  return out;
}

/**
 * Há alvos legais para todas as especificações obrigatórias? Conta também as que pedem
 * alvos diferentes entre si ("outra criatura alvo", CR 115.3).
 */
export function enoughTargets(g: G, specs: import('./defs.ts').TargetSpec[], p: PlayerId, source: ObjId): boolean {
  for (let i = 0; i < specs.length; i++) {
    const sp = specs[i];
    const min = sp.min ?? 1;
    if (min === 0) continue;
    const cands = candidateTargets(g, sp, p, source);
    let need = min;
    for (const j of sp.differentFrom ?? []) need += specs[j]?.min ?? 1;
    if (cands.length < (sp.differentFrom?.length ? need : min)) return false;
  }
  return true;
}

/** checagem rápida: dá para começar a conjurar e pagar? (CR 601.3) */
export function canStartCast(g: G, p: PlayerId, opt: CastOption): boolean {
  const s = g.state;
  const o = s.objects[opt.obj];
  const c = chars(g, opt.obj);
  const f = faceDefOf(o);
  const instantSpeed = c.types.includes('Instant') || hasKw(g, opt.obj, 'flash') || f?.flash;
  if (!instantSpeed && !sorceryTiming(g, p)) return false;
  if (hooks(g, 'cantCastSpells').some((h) => h.fn(h.ctx, p))) return false;
  // alvos obrigatórios possíveis
  const sp = f?.spell;
  if (sp?.modes) {
    const ctx: SCtx = { g, you: p, source: opt.obj };
    const possible = sp.modes.modes.filter((m) => (m.targets ?? []).every((t) => (t.min ?? 1) === 0 || candidateTargets(g, t, p, opt.obj).length >= (t.min ?? 1))).length;
    if (possible < sp.modes.min) return false;
    void ctx;
  }
  const { specs } = spellTargetSpecs(o, [], opt.method.key);
  if (!enoughTargets(g, specs, p, opt.obj)) return false;
  // custos adicionais obrigatórios não-mana
  for (const ac of f?.additionalCosts ?? []) {
    if (ac.optional || ac.repeatable) continue;
    const okA = canPayParts(g, p, ac.parts.filter((x) => x.k !== 'mana'), opt.obj, 0);
    const okB = ac.orParts ? canPayParts(g, p, ac.orParts.filter((x) => x.k !== 'mana'), opt.obj, 0) : false;
    if (!okA && !okB) return false;
  }
  if (opt.method.alt?.parts && !canPayParts(g, p, opt.method.alt.parts, opt.obj, 0)) return false;
  if (opt.method.permission?.parts && !canPayParts(g, p, opt.method.permission.parts, opt.obj, 0)) return false;
  // reduções que dependem do alvo (Killian, Ink Duelist): estima com os alvos possíveis; se no fim
  // não der para pagar, a conjuração é desfeita (CR 733)
  const targetsGuess = specs.map((t) => candidateTargets(g, t, p, opt.obj).slice(0, 4));
  let cost = totalSpellCost(g, p, o, opt.method, { x: 0, targets: targetsGuess, paid: {} });
  // delve: cada carta do cemitério pode pagar {1} do genérico (CR 702.66a)
  if (faceDefOf(o)?.delve) cost = reduceGeneric(cost, g.state.zones.graveyard[p].filter((id) => id !== opt.obj).length);
  return canAfford(g, p, cost, { purpose: { kind: 'spell', obj: opt.obj }, anyType: opt.method.permission?.anyType });
}

function landPlayOptions(g: G, p: PlayerId): { obj: ObjId; key: string }[] {
  const s = g.state;
  if (!sorceryTiming(g, p) || s.turn.landsPlayed >= 1) return []; // CR 305.2
  const out: { obj: ObjId; key: string }[] = [];
  for (const id of s.zones.hand[p]) if (chars(g, id).types.includes('Land')) out.push({ obj: id, key: 'hand' });
  for (const zone of ['graveyard', 'exile'] as const) {
    const ids = zone === 'graveyard' ? s.zones.graveyard[p] : s.zones.exile;
    for (const id of ids) {
      if (!chars(g, id).types.includes('Land')) continue;
      const prm = permissionsFor(g, p, id).find((x) => x.land);
      if (prm) out.push({ obj: id, key: `perm:${prm.key}` });
    }
  }
  return out;
}

export function legalActions(g: G, p: PlayerId): PriorityAction[] {
  const s = g.state;
  const acts: PriorityAction[] = [{ id: 'pass', kind: 'pass', label: 'Passar a prioridade' }];
  for (const l of landPlayOptions(g, p)) acts.push({ id: `play:${l.obj}:${l.key}`, kind: 'play', label: `Jogar ${nameOf(g, l.obj)}`, obj: l.obj });
  for (const opt of castOptions(g, p)) {
    if (canStartCast(g, p, opt)) acts.push({ id: `cast:${opt.obj}:${opt.method.key}`, kind: 'cast', label: `${opt.method.key === 'hand' ? 'Conjurar' : opt.method.label}: ${nameOf(g, opt.obj)}`, obj: opt.obj });
  }
  const timing = { sorcery: sorceryTiming(g, p) };
  const zones: ObjId[] = [...s.zones.battlefield, ...s.zones.hand[p], ...s.zones.graveyard[p], ...s.zones.exile.filter((id) => s.objects[id].owner === p)];
  for (const id of zones) {
    for (const { inst, def } of abilityDefs(g, id)) {
      if (def.kind !== 'activated') continue;
      if (!canActivate(g, p, id, def as ActivatedDef, timing)) continue;
      acts.push({ id: `act:${id}:${inst.id}`, kind: 'activate', label: `${nameOf(g, id)}: ${def.text ?? def.kw ?? 'habilidade'}`, obj: id });
    }
  }
  for (const m of manaOptions(g, p)) acts.push({ id: `mana:${m.key}`, kind: 'mana', label: `${nameOf(g, m.obj)}: adicionar ${m.alt.map((t) => `{${t}}`).join('')}`, obj: m.obj });
  // ação especial: virar para cima uma permanente manifestada (CR 116.2b, 701.40a)
  for (const id of s.zones.battlefield) {
    if (controllerOf(g, id) !== p) continue;
    const custo = manifestFaceUpCost(g, id);
    if (custo && canAfford(g, p, custo, { purpose: { kind: 'effect' } })) acts.push({ id: `faceup:${id}`, kind: 'special', label: `Virar para cima ${nameOf(g, id)} (${formatCost(custo)})`, obj: id });
  }
  if (s.config.manualMode) acts.push({ id: 'manual', kind: 'manual', label: 'Ajuste manual' });
  return acts;
}

/** executa a ação escolhida; devolve true se alguma coisa aconteceu (zera a contagem de passes) */
export function* performAction(g: G, p: PlayerId, actionId: string): Gen<boolean> {
  const [kind, a, b] = actionId.split(':');
  if (kind === 'play') {
    const id = Number(a);
    const o = g.state.objects[id];
    if (!o) return false;
    g.state.turn.landsPlayed++;
    g.log(`${g.state.players[p].name} joga ${nameOf(g, id)}.`, { rule: '305.1' });
    if (b?.startsWith('perm:')) {
      const prm = permissionsFor(g, p, id).find((x) => `perm:${x.key}` === b);
      const [nid] = yield* putOntoBattlefield(g, [{ id, controller: p }], 'play');
      if (prm?.onUse && nid !== undefined) prm.onUse({ g, you: p, source: nid }, nid);
    } else yield* putOntoBattlefield(g, [{ id, controller: p }], 'play');
    return true;
  }
  if (kind === 'cast') {
    const id = Number(a);
    const methodKey = actionId.split(':').slice(2).join(':');
    const opt = castOptions(g, p).find((x) => x.obj === id && x.method.key === methodKey);
    if (!opt) return false;
    const r = yield* castSpell(g, p, id, opt.method);
    return r !== null;
  }
  if (kind === 'act') {
    const id = Number(a);
    const abilityId = actionId.split(':').slice(2).join(':');
    const r = yield* activateAbility(g, p, id, abilityId);
    return r !== null;
  }
  if (kind === 'faceup') return yield* turnFaceUp(g, p, Number(a));
  if (kind === 'mana') {
    const key = actionId.slice(5);
    const opt = manaOptions(g, p).find((m) => m.key === key);
    if (!opt) return false;
    return yield* activateManaAbility(g, p, opt);
  }
  return false;
}

export { cardDef, manaPart, chooseModes };
