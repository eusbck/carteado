// Ações possíveis com prioridade (CR 117.1) e sua execução.

import { putOntoBattlefield } from './actions.ts';
import { abilityDefs, chars, colorsOf, controllerOf, hasKw, hooks, nameOf, printedChars } from './chars.ts';
import { canStartFaceDown, castOptionsExtra, morphFaceUpCost, turnFaceUpMorph } from './conjurar-alternativo.ts';
import { activateManaAbility, canAfford, canPayParts, manaOptions, manaPart } from './costs.ts';
import { cardDef, type ActivatedDef, type CastPermission, type Gen, type SCtx } from './defs.ts';
import type { G } from './game-context.ts';
import { convokeAll, formatCost, parseCost, reduceGeneric } from './mana.ts';
import { doSuspend, manifestFaceUpCost, suspendParams, turnFaceUp } from './mecanicas.ts';
import { activateAbility, candidateTargets, canActivate, castChars, castSpell, chooseModes, custosAdicionais, spellTargetSpecs, totalSpellCost, faceDefFor, faceDefOf, type CastMethod } from './stack.ts';
import {
  chaveComFace, ehAventura, ehSala, FACE_AMBAS, FACE_NENHUMA, faceDaChave, facesConjuraveis, facesDeTerreno, metadeAftermath,
  nomeDaFace, rotuloConjurar, temVariasFaces,
} from './formatos.ts';
import { oracle } from './oracle.ts';
import { payMana } from './costs.ts';
import { emit } from './triggers.ts';
import type { ManaSymbol, ObjId, PlayerId, PriorityAction, ZoneName } from './types.ts';

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

/**
 * Carta de várias faces (modal de duas faces, dividida, aventura): uma opção por face que pode ser conjurada daquela
 * zona (formatos.ts facesConjuraveis), com a chave da ação marcando a face ('hand@1') e o rótulo dizendo o que se
 * conjura ("Conjurar Locthwain Scorn (aventura)").
 */
function opcoesDeFaces(g: G, p: PlayerId, id: ObjId, zone: ZoneName, out: CastOption[]): void {
  const s = g.state;
  const o = s.objects[id];
  const def = o.def;
  const faces = facesConjuraveis(def, zone);
  const push = (key: string, face: number, title: string, extra: Partial<CastMethod> = {}) =>
    out.push({ obj: id, method: { key: face === FACE_AMBAS ? 'fuse' : chaveComFace(key, face), label: extra.label ?? 'conjurar', zone, face, title, ...extra } });
  const altCosts = (face: number, zona: ZoneName) => face === FACE_AMBAS ? [] : (cardDef(def)?.faces[face]?.altCosts ?? []).filter((a) => a.zone === zona && (!a.condition || a.condition({ g, you: p, source: id })));
  if (zone === 'hand') {
    for (const f of faces) {
      push('hand', f, rotuloConjurar(def, f));
      for (const alt of altCosts(f, 'hand')) push(alt.key, f, `${alt.label}: ${nomeDaFace(def, f)}`, { label: alt.label, alt });
    }
  } else if (zone === 'command') {
    if (o.owner === p && o.card !== null && s.cards[o.card].isCommander) for (const f of faces) if (f !== FACE_AMBAS) push('command', f, rotuloConjurar(def, f, 'Conjurar da zona de comando:'), { label: 'conjurar da zona de comando' });
  } else {
    if (zone === 'graveyard' && o.owner === p) {
      for (const f of faces) for (const alt of altCosts(f, 'graveyard')) push(alt.key, f, `${alt.label}: ${nomeDaFace(def, f)}`, { label: alt.label, alt });
      // aftermath: a metade da direita se conjura do cemitério (CR 702.127a)
      const af = metadeAftermath(def);
      if (af !== null) out.push({ obj: id, method: { key: 'aftermath', label: 'aftermath', zone, face: af, title: `Conjurar ${nomeDaFace(def, af)} do cemitério (aftermath)` } });
    }
    // aventura que resolveu: quem a conjurou pode conjurar a carta do exílio, mas não como aventura (CR 715.3d)
    if (zone === 'exile' && ehAventura(def) && o.data.adventureOf === p) out.push({ obj: id, method: { key: 'adventure', label: 'aventura', zone, face: 0, title: `Conjurar ${nomeDaFace(def, 0)} do exílio (aventura)` } });
    for (const prm of permissionsFor(g, p, id)) {
      if (prm.filter && !prm.filter({ g, you: p, source: id }, id)) continue;
      for (const f of faces) if (f !== FACE_AMBAS) push(`perm:${prm.key}`, f, `${prm.label}: ${nomeDaFace(def, f)}`, { label: prm.label, permission: prm });
    }
  }
}

/** maneiras de conjurar cada carta agora (zona e custo), sem checar o pagamento */
export function castOptions(g: G, p: PlayerId): CastOption[] {
  const s = g.state;
  const out: CastOption[] = [];
  const consider = (id: ObjId, zone: ZoneName) => {
    const o = s.objects[id];
    if (!o.copyOf && temVariasFaces(o.def)) { opcoesDeFaces(g, p, id, zone, out); return; }
    const c = chars(g, id);
    // morph (também de terreno com morph) e custos alternativos do comandante (motor/conjurar-alternativo.ts)
    out.push(...castOptionsExtra(g, p, id, zone));
    if (c.types.includes('Land')) return; // CR 305.9
    const f = faceDefOf(o);
    if (zone === 'hand') {
      out.push({ obj: id, method: { key: 'hand', label: 'conjurar', zone } });
      for (const alt of f?.altCosts ?? []) if (alt.zone === 'hand' && (!alt.condition || alt.condition({ g, you: p, source: id }))) out.push({ obj: id, method: { key: alt.key, label: alt.label, zone, alt } });
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
  // lote2-d: a carta do topo do grimório com permissão de conjurar dali (Realmwalker)
  for (const id of s.zones.library[p].slice(0, 1)) if (permissionsFor(g, p, id).length) consider(id, 'library');
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
  // virada para baixo (morph): criatura 2/2 sem texto, outra checagem (CR 708.4)
  if (opt.method.alt?.faceDown) return canStartFaceDown(g, p, opt);
  const o = s.objects[opt.obj];
  // só a face ou metade escolhida conta (CR 709.3a, 712.11c, 715.3a)
  const c = castChars(g, p, o, opt.method);
  const f = faceDefFor(o, opt.method);
  const flash = opt.method.face === undefined ? hasKw(g, opt.obj, 'flash') : c.abilities.some((a) => a.kw === 'flash');
  const instantSpeed = c.types.includes('Instant') || flash || f?.flash || hooks(g, 'castAsThoughFlash').some((h) => h.fn(h.ctx, p, opt.obj))
    || g.state.effects.some((e) => e.mods.some((m) => m.k === 'rule' && m.id === 'rule:flashNext' && m.params?.player === p && c.subtypes.includes(m.params?.tipo as string)));
  // custo alternativo com momento próprio (sneak: na sua etapa de declarar bloqueadores, CR 702.190a)
  if (opt.method.alt?.timing) { if (!opt.method.alt.timing({ g, you: p, source: opt.obj })) return false; }
  else if (!instantSpeed && !sorceryTiming(g, p)) return false;
  if (hooks(g, 'cantCastSpells').some((h) => h.fn(h.ctx, p))) return false;
  if (f?.castOnlyIf && !f.castOnlyIf({ g, you: p, source: opt.obj })) return false;
  // proibição por valor de mana: com {X} no custo o valor só é conhecido ao conjurar (conferido de novo em stack.ts)
  if (!(c.manaCost ?? []).some((x) => x.k === 'X') && hooks(g, 'cantCastSpell').some((h) => h.fn(h.ctx, p, opt.obj, opt.method.alt?.faceDown ? 0 : c.manaValue))) return false;
  // alvos obrigatórios possíveis
  const sp = f?.spell;
  if (sp?.modes) {
    const ctx: SCtx = { g, you: p, source: opt.obj };
    const possible = sp.modes.modes.filter((m) => (m.targets ?? []).every((t) => (t.min ?? 1) === 0 || candidateTargets(g, t, p, opt.obj).length >= (t.min ?? 1))).length;
    // com "pode escolher o mesmo modo mais de uma vez" (CR 700.2d), basta um modo possível
    if (possible < (sp.modes.repeat ? 1 : sp.modes.min)) return false;
    void ctx;
  }
  const { specs } = spellTargetSpecs(o, [], opt.method.key, opt.method.face);
  if (!enoughTargets(g, specs, p, opt.obj)) return false;
  // custos adicionais obrigatórios não-mana
  for (const ac of custosAdicionais(g, p, opt.obj, f)) {
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
  if (f?.delve) cost = reduceGeneric(cost, g.state.zones.graveyard[p].filter((id) => id !== opt.obj).length);
  // convoke: as criaturas desviradas também pagam (CR 702.51a); também o concedido às mágicas (Dazzling Theater)
  if (f?.convoke || hooks(g, 'spellsHaveConvoke').some((h) => h.fn(h.ctx, p, opt.obj, c))) {
    const cores = g.state.zones.battlefield.filter((id) => controllerOf(g, id) === p && chars(g, id).types.includes('Creature') && !s.objects[id].tapped)
      .map((id) => colorsOf(g, id)).sort((a, b) => a.length - b.length);
    cost = convokeAll(cost, cores).cost;
  }
  return canAfford(g, p, cost, { purpose: { kind: 'spell', obj: opt.obj }, anyType: opt.method.permission?.anyType, improvise: f?.improvise });
}

/** faces de terreno de uma carta: a frente, se for terreno, ou a face de terreno do modal de duas faces (CR 712.12) */
function facesJogaveis(g: G, id: ObjId): number[] {
  const o = g.state.objects[id];
  if (!o.copyOf && temVariasFaces(o.def)) return facesDeTerreno(o.def);
  return chars(g, id).types.includes('Land') ? [0] : [];
}

function landPlayOptions(g: G, p: PlayerId): { obj: ObjId; key: string; face: number }[] {
  const s = g.state;
  if (!sorceryTiming(g, p) || s.turn.landsPlayed >= 1 + (s.turn.extraLands ?? 0)) return []; // CR 305.2
  const out: { obj: ObjId; key: string; face: number }[] = [];
  for (const id of s.zones.hand[p]) for (const face of facesJogaveis(g, id)) out.push({ obj: id, key: chaveComFace('hand', face), face });
  for (const zone of ['graveyard', 'exile'] as const) {
    const ids = zone === 'graveyard' ? s.zones.graveyard[p] : s.zones.exile;
    for (const id of ids) {
      const faces = facesJogaveis(g, id);
      if (!faces.length) continue;
      const prm = permissionsFor(g, p, id).find((x) => x.land);
      if (prm) for (const face of faces) out.push({ obj: id, key: chaveComFace(`perm:${prm.key}`, face), face });
    }
  }
  return out;
}

/** custo para destrancar a porta trancada de uma Sala (CR 709.5e), ou null se ela já está destrancada */
function custoDaPorta(g: G, id: ObjId, half: number): ManaSymbol[] | null {
  const o = g.state.objects[id];
  if (o.copyOf || o.phasedOut || !ehSala(o.def)) return null;
  if (o.face === FACE_AMBAS || o.face === half) return null;
  return oracle(o.def).faces[half]?.manaCost ?? [];
}

/** destrancar uma porta (CR 709.5e-f): a Sala ganha a designação; com as duas, a Sala foi destrancada por inteiro (709.5i) */
export function unlockDoor(g: G, id: ObjId, half: number, player: PlayerId): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || !ehSala(o.def) || o.face === FACE_AMBAS || o.face === half) return false;
  o.face = o.face === FACE_NENHUMA ? half : FACE_AMBAS;
  g.bump();
  g.log(`${g.state.players[player].name} destranca ${nomeDaFace(o.def, half)}.`, { rule: '709.5e' });
  emit(g, [{ type: 'unlock', obj: id, halves: [half], player, full: o.face === FACE_AMBAS }]);
  return true;
}

export function legalActions(g: G, p: PlayerId): PriorityAction[] {
  const s = g.state;
  const acts: PriorityAction[] = [{ id: 'pass', kind: 'pass', label: 'Passar a prioridade' }];
  for (const l of landPlayOptions(g, p)) {
    const o = s.objects[l.obj];
    const nome = !o.copyOf && temVariasFaces(o.def) ? nomeDaFace(o.def, l.face) : nameOf(g, l.obj);
    acts.push({ id: `play:${l.obj}:${l.key}`, kind: 'play', label: `Jogar ${nome}`, obj: l.obj });
  }
  for (const opt of castOptions(g, p)) {
    if (canStartCast(g, p, opt)) acts.push({ id: `cast:${opt.obj}:${opt.method.key}`, kind: 'cast', label: opt.method.title ?? `${opt.method.key === 'hand' ? 'Conjurar' : opt.method.label}: ${nameOf(g, opt.obj)}`, obj: opt.obj });
  }
  const timing = { sorcery: sorceryTiming(g, p) };
  // da zona de comando: o ninjutsu de comandante (CR 702.49d)
  const zones: ObjId[] = [...s.zones.battlefield, ...s.zones.hand[p], ...s.zones.graveyard[p], ...s.zones.exile.filter((id) => s.objects[id].owner === p),
    ...s.zones.command.filter((id) => s.objects[id].owner === p && s.objects[id].card !== null)];
  for (const id of zones) {
    for (const { inst, def } of abilityDefs(g, id)) {
      if (def.kind !== 'activated') continue;
      if (!canActivate(g, p, id, def as ActivatedDef, timing)) continue;
      acts.push({ id: `act:${id}:${inst.id}`, kind: 'activate', label: `${nameOf(g, id)}: ${def.text ?? def.kw ?? 'habilidade'}`, obj: id });
    }
  }
  for (const m of manaOptions(g, p)) acts.push({ id: `mana:${m.key}`, kind: 'mana', label: `${nameOf(g, m.obj)}: adicionar ${m.alt.map((t) => `{${t}}`).join('')}`, obj: m.obj });
  // ação especial: suspender uma carta da mão quando poderia conjurá-la (CR 116.2f, 702.62a)
  for (const id of s.zones.hand[p]) {
    const prm = suspendParams(g, id);
    if (!prm) continue;
    const c = chars(g, id);
    const quando = c.types.includes('Instant') || hasKw(g, id, 'flash') || timing.sorcery;
    if (quando && canAfford(g, p, parseCost(prm.custo), { purpose: { kind: 'effect' } })) acts.push({ id: `suspend:${id}`, kind: 'special', label: `Suspender ${nameOf(g, id)} (${prm.custo})`, obj: id });
  }
  // ação especial: destrancar a porta de uma Sala sua, como feitiço, pagando o custo dela (CR 116.2m, 709.5e)
  if (timing.sorcery) {
    for (const id of s.zones.battlefield) {
      if (controllerOf(g, id) !== p) continue;
      for (const half of [0, 1]) {
        const custo = custoDaPorta(g, id, half);
        if (custo && canAfford(g, p, custo, { purpose: { kind: 'effect' } })) acts.push({ id: `unlock:${id}:${half}`, kind: 'special', label: `Destrancar ${nomeDaFace(s.objects[id].def, half)} (${formatCost(custo) || '{0}'})`, obj: id });
      }
    }
  }
  // ação especial: virar para cima uma permanente manifestada (CR 116.2b, 701.40a)
  for (const id of s.zones.battlefield) {
    if (controllerOf(g, id) !== p) continue;
    const custo = manifestFaceUpCost(g, id);
    if (custo && canAfford(g, p, custo, { purpose: { kind: 'effect' } })) acts.push({ id: `faceup:${id}`, kind: 'special', label: `Virar para cima ${nameOf(g, id)} (${formatCost(custo)})`, obj: id });
    // morph (CR 702.37e): virar para cima pagando o custo de metamorfose
    const morph = morphFaceUpCost(g, id);
    if (morph && canAfford(g, p, morph, { purpose: { kind: 'effect' } })) {
      const o = s.objects[id];
      acts.push({ id: `morph:${id}`, kind: 'special', label: `Virar para cima ${printedChars(o.copyOf?.def ?? o.def, 0, o.owner).name} (metamorfose ${formatCost(morph)})`, obj: id });
    }
  }
  if (s.config.manualMode) acts.push({ id: 'manual', kind: 'manual', label: 'Ajuste manual' });
  return acts;
}

/** executa a ação escolhida; devolve true se alguma coisa aconteceu (zera a contagem de passes) */
export function* performAction(g: G, p: PlayerId, actionId: string): Gen<boolean> {
  const [kind, a] = actionId.split(':');
  const b = actionId.split(':').slice(2).join(':'); // 'perm:<chave>' pode conter ':'
  if (kind === 'play') {
    const id = Number(a);
    const o = g.state.objects[id];
    if (!o) return false;
    // face de terreno escolhida do modal de duas faces: entra com ela para cima (CR 712.12)
    const [chave, face] = faceDaChave(b ?? '');
    g.state.turn.landsPlayed++;
    g.log(`${g.state.players[p].name} joga ${face && !o.copyOf && temVariasFaces(o.def) ? nomeDaFace(o.def, face) : nameOf(g, id)}.`, { rule: face ? '712.12' : '305.1' });
    if (chave.startsWith('perm:')) {
      const prm = permissionsFor(g, p, id).find((x) => `perm:${x.key}` === chave);
      const [nid] = yield* putOntoBattlefield(g, [{ id, controller: p, face }], 'play');
      if (prm?.onUse && nid !== undefined) prm.onUse({ g, you: p, source: nid }, nid);
    } else yield* putOntoBattlefield(g, [{ id, controller: p, face }], 'play');
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
  if (kind === 'unlock') {
    const id = Number(a);
    const half = Number(b);
    const custo = custoDaPorta(g, id, half);
    if (custo === null || controllerOf(g, id) !== p || !sorceryTiming(g, p)) return false;
    const pago = yield* payMana(g, p, custo, { purpose: { kind: 'effect' }, canCancel: true, label: `destrancar ${nomeDaFace(g.state.objects[id].def, half)}` });
    if (pago === null) return false;
    return unlockDoor(g, id, half, p);
  }
  if (kind === 'morph') return yield* turnFaceUpMorph(g, p, Number(a));
  if (kind === 'suspend') return yield* doSuspend(g, p, Number(a));
  if (kind === 'mana') {
    const key = actionId.slice(5);
    const opt = manaOptions(g, p).find((m) => m.key === key);
    if (!opt) return false;
    return yield* activateManaAbility(g, p, opt);
  }
  return false;
}

export { cardDef, manaPart, chooseModes };
