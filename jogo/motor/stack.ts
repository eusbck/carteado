// Pilha: conjurar mágicas (CR 601), ativar habilidades (CR 602), pôr gatilhos na pilha
// (CR 603.3), alvos (CR 115) e resolução (CR 608).

import { addEffect, cloneState, createObject, destroyObject, moveRaw, newTimestamp, removeEffect } from './state.ts';
import { ask, chooseItems, chooseNumber, objItem, playerItem, yesNo } from './ask.ts';
import type { GameEvent } from './events.ts';
import { moveObject, moveObjects, protectionMatches, putOntoBattlefield, enchantCandidates, tap } from './actions.ts';
import { abilityDefs, chars, colorsOf, controllerOf, hasKw, hooks, isType, kwParams, nameOf, printedChars, currentFace } from './chars.ts';
import { playerProtectedFrom } from './actions.ts';
import { canAfford, canPayParts, manaOptions, manaPart, payMana, payParts, type PayContext } from './costs.ts';
import {
  ability, cardDef, registry, type ActivatedDef, type AdditionalCostDef, type AltCastDef, type CastPermission, type Ctx, type FaceDef, type Gen,
  type ModeSpec, type SCtx, type SpellDef, type TargetSpec, type TriggeredDef,
} from './defs.ts';
import type { G } from './game-context.ts';
import { addGeneric, convokeOne, formatCost, manaValueOf, parseCost, reduceGeneric, withX } from './mana.ts';
import { emit } from './triggers.ts';
import { ehAventura, ehDividida, FACE_AMBAS, facesConjuraveis, metadeAftermath, rotuloConjurar, temVariasFaces } from './formatos.ts';
import type { Answer, Chars, GameObject, GameState, ManaSymbol, ObjId, PlayerId, StackInfo, TargetRef, ZoneName } from './types.ts';

// ---------------------------------------------------------------------------
// Alvos (CR 115, 608.2b)
// ---------------------------------------------------------------------------
export function targetLabel(g: G, t: TargetRef): string {
  return t.kind === 'player' ? g.state.players[t.id].name : nameOf(g, t.id);
}

function sourceQualities(g: G, source: ObjId) {
  const c = g.state.objects[source] ? chars(g, source) : g.state.lki[source]?.chars;
  return { colors: c?.colors ?? [], types: c?.types ?? [], id: source };
}

/** o alvo é legal para esta especificação, vindo de uma mágica/habilidade controlada por `controller`? */
export function isLegalTarget(g: G, spec: TargetSpec, t: TargetRef, controller: PlayerId, source: ObjId, sourceIsSpell = true, event?: Record<string, unknown>): boolean {
  const s = g.state;
  const ctx: SCtx = { g, you: controller, source, event };
  if (t.kind === 'player') {
    if (spec.what !== 'player' && spec.what !== 'any') return false;
    if (s.players[t.id]?.left !== false) return false;
    if (controller !== t.id && hooks(g, 'playerHexproof').some((h) => h.fn(h.ctx, t.id)) && g.isOpponent(controller, t.id)) return false; // CR 702.11c
    if (playerProtectedFrom(g, t.id, sourceQualities(g, source))) return false; // CR 702.16b
    return !spec.filter || spec.filter(ctx, t);
  }
  const o = s.objects[t.id];
  if (!o) return false;
  if (spec.what === 'player') return false;
  if (spec.what === 'ability') { if (o.zone !== 'stack' || !o.stack || o.stack.kind === 'spell') return false; } // habilidade ativada ou desencadeada na pilha
  else if (spec.what === 'spell' || (spec.what === 'spellOrPermanent' && o.zone === 'stack')) { if (o.zone !== 'stack' || o.stack?.kind !== 'spell') return false; if (t.id === source) return false; } // CR 115.5
  else if (spec.what === 'card') { if (o.zone !== (spec.zone ?? 'graveyard')) return false; }
  else {
    if (o.zone !== 'battlefield' || o.phasedOut) return false;
    if (spec.what === 'any' && !chars(g, t.id).types.some((x) => x === 'Creature' || x === 'Planeswalker' || x === 'Battle')) return false; // CR 115.4
    // hexproof, shroud e proteção só valem para permanentes (CR 702.11, 702.18, 702.16b)
    const lose = hooks(g, 'loseHexproof').some((h) => h.fn(h.ctx, t.id));
    if (!lose && hasKw(g, t.id, 'shroud')) return false;
    if (!lose && hasKw(g, t.id, 'hexproof') && g.isOpponent(controller, controllerOf(g, t.id))) return false;
    const q = sourceQualities(g, source);
    if (kwParams(g, t.id, 'protection').some((p) => protectionMatches(g, p, q))) return false;
  }
  void sourceIsSpell;
  return !spec.filter || spec.filter(ctx, t);
}

export function candidateTargets(g: G, spec: TargetSpec, controller: PlayerId, source: ObjId, event?: Record<string, unknown>): TargetRef[] {
  const s = g.state;
  const out: TargetRef[] = [];
  if (spec.what === 'player' || spec.what === 'any') for (const p of g.playersInGame()) out.push({ kind: 'player', id: p });
  if (spec.what === 'object' || spec.what === 'any' || spec.what === 'spellOrPermanent') for (const id of s.zones.battlefield) out.push({ kind: 'obj', id });
  if (spec.what === 'spell' || spec.what === 'spellOrPermanent' || spec.what === 'ability') for (const id of s.zones.stack) out.push({ kind: 'obj', id });
  if (spec.what === 'card') {
    const zone = spec.zone ?? 'graveyard';
    const ids = zone === 'graveyard' || zone === 'hand' || zone === 'library' ? s.zones[zone].flat() : s.zones[zone];
    for (const id of ids) out.push({ kind: 'obj', id });
  }
  return out.filter((t) => isLegalTarget(g, spec, t, controller, source, true, event));
}

function specMax(g: G, spec: TargetSpec, ctx: SCtx & { x?: number }): number {
  return typeof spec.max === 'function' ? spec.max(ctx) : (spec.max ?? 1);
}

/** escolhe alvos para uma lista de especificações (CR 601.2c). null = impossível */
export function* chooseTargets(g: G, player: PlayerId, specs: TargetSpec[], source: ObjId, label: string, x = 0, event?: Record<string, unknown>): Gen<TargetRef[][] | null> {
  const chosen: TargetRef[][] = [];
  const ctx: SCtx & { x: number } = { g, you: player, source, x, event };
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    let cands = candidateTargets(g, spec, player, source, event);
    if (spec.differentFrom) {
      const used = spec.differentFrom.flatMap((j) => chosen[j] ?? []);
      cands = cands.filter((t) => !used.some((u) => u.kind === t.kind && u.id === t.id));
    }
    const min = spec.min ?? 1;
    const max = Math.min(specMax(g, spec, ctx), cands.length);
    if (cands.length < min) return null;
    if (max === 0) { chosen.push([]); continue; }
    const items = cands.map((t) => (t.kind === 'player' ? playerItem(g, t.id) : objItem(g, t.id, targetLabel(g, t))));
    // conjunto de alvos com restrição (soma de força, jogadores diferentes…): resposta inválida é recusada
    const conjunto = (ids: string[]) => ids.map((id) => cands[items.findIndex((it) => it.id === id)]);
    const valida = spec.validateSet ? (a: Answer) => (a.kind === 'select' && !spec.validateSet!(ctx, conjunto(a.ids)) ? 'Essa combinação de alvos não é permitida' : null) : undefined;
    const resp = yield* ask<Extract<Answer, { kind: 'select' }>>(g, { kind: 'select', player, prompt: `${label}: escolha ${spec.label}${max > 1 ? ` (até ${max})` : ''}`, items, min, max }, valida);
    const ids = resp.ids;
    chosen.push(ids.map((id) => cands[items.findIndex((it) => it.id === id)]));
  }
  return chosen;
}

// ---------------------------------------------------------------------------
// Definições de mágica
// ---------------------------------------------------------------------------
export function faceDefOf(o: GameObject): FaceDef | undefined {
  // mágica ou permanente virada para baixo não tem texto (CR 708.2a): nem custos, alvos ou "não pode ser anulada"
  if (o.faceDown && (o.zone === 'stack' || o.zone === 'battlefield')) return undefined;
  const name = o.copyOf?.def ?? o.def;
  const face = o.copyOf ? o.copyOf.face : (o.zone === 'stack' ? o.face : 0);
  return cardDef(name)?.faces[face];
}

/** a face que vai ser conjurada por este método: a escolhida (CR 709.3, 712.11b, 715.3) ou a de sempre */
function faceDoMetodo(o: GameObject, method?: Pick<CastMethod, 'face'>): number {
  if (o.copyOf) return o.copyOf.face;
  if (o.zone === 'stack') return o.face;
  return method?.face ?? 0;
}

/** definição da face que vai ser conjurada (a da pilha, se já estiver lá); a mágica fundida não tem uma só */
export function faceDefFor(o: GameObject, method?: Pick<CastMethod, 'face'>): FaceDef | undefined {
  const face = faceDoMetodo(o, method);
  if (face === FACE_AMBAS) return undefined;
  return cardDef(o.copyOf?.def ?? o.def)?.faces[face];
}

/**
 * Características da mágica que vai ser conjurada: só a face ou metade escolhida conta para ver se pode ser conjurada
 * (CR 709.3a, 712.11c, 715.3a). Fora da pilha, a carta pode ter outras características (a dividida tem as duas metades,
 * 709.4): para a face escolhida valem as impressas dela, com o controlador de quem conjura.
 */
export function castChars(g: G, player: PlayerId, o: GameObject, method?: Pick<CastMethod, 'face'>): Chars {
  if (o.zone === 'stack' || method?.face === undefined || o.copyOf || method.face === currentFace(o)) return chars(g, o.id);
  return { ...printedChars(o.def, method.face, player), controller: player };
}

/** especificações de alvo de uma mágica na pilha, na ordem: alvos da mágica, alvos dos modos, encantar. A mágica
 *  fundida tem os alvos das duas metades, a da esquerda primeiro (CR 702.102d); `half` diz de qual é cada grupo */
export function spellTargetSpecs(o: GameObject, modes: number[], method?: string, face?: number): { specs: TargetSpec[]; groups: { mode: number | null; start: number; count: number; half?: number }[] } {
  const fc = face ?? faceDoMetodo(o);
  const def = o.copyOf?.def ?? o.def;
  if (fc === FACE_AMBAS && ehDividida(def)) {
    const specs: TargetSpec[] = [];
    const groups: { mode: number | null; start: number; count: number; half?: number }[] = [];
    for (const half of [0, 1]) {
      const t = cardDef(def)?.faces[half]?.spell?.targets ?? [];
      groups.push({ mode: null, start: specs.length, count: t.length, half });
      specs.push(...t);
    }
    return { specs, groups };
  }
  const f = face === undefined ? faceDefOf(o) : cardDef(def)?.faces[fc];
  const specs: TargetSpec[] = [];
  const groups: { mode: number | null; start: number; count: number; half?: number }[] = [];
  const sp = f?.spell;
  // sobrecarga (CR 702.96a-b): "alvo" vira "cada"; a mágica não tem alvos (os grupos ficam vazios para os modos)
  if (method && f?.altCosts?.some((a) => a.key === method && a.noTargets)) {
    if (sp?.targets) groups.push({ mode: null, start: 0, count: 0 });
    for (const m of sp?.modes ? modes : []) groups.push({ mode: m, start: 0, count: 0 });
    return { specs, groups };
  }
  // sem o presente prometido, os alvos da parte do presente não são escolhidos (CR 702.174m)
  if (sp?.targets) { groups.push({ mode: null, start: 0, count: sp.targets.length }); specs.push(...sp.targets.map((t) => (t.gift && !o.stack?.paid.gift ? { ...t, min: 0, max: 0 } : t))); }
  if (sp?.modes) pushModeSpecs(sp.modes, modes, specs, groups);
  const isAura = f?.enchant && (method === 'bestow' || !f.altCosts?.some((a) => a.asAura));
  if (isAura && f?.enchant) { groups.push({ mode: -1, start: specs.length, count: 1 }); specs.push(f.enchant); }
  return { specs, groups };
}

function abilityTargetSpecs(def: ActivatedDef | TriggeredDef, modes: number[]): { specs: TargetSpec[]; groups: { mode: number | null; start: number; count: number }[] } {
  const specs: TargetSpec[] = [];
  const groups: { mode: number | null; start: number; count: number }[] = [];
  if (def.targets) { groups.push({ mode: null, start: 0, count: def.targets.length }); specs.push(...def.targets); }
  if (def.modes) pushModeSpecs(def.modes, modes, specs, groups);
  return { specs, groups };
}

/** alvos dos modos escolhidos; com differentPlayers, cada modo mira um jogador diferente dos anteriores */
function pushModeSpecs(ms: ModeSpec, modes: number[], specs: TargetSpec[], groups: { mode: number | null; start: number; count: number }[]): void {
  const anteriores: number[] = [];
  for (const m of modes) {
    const t = ms.modes[m].targets ?? [];
    groups.push({ mode: m, start: specs.length, count: t.length });
    for (const spec of t) {
      specs.push(ms.differentPlayers && anteriores.length ? { ...spec, differentFrom: [...(spec.differentFrom ?? []), ...anteriores] } : spec);
    }
    for (let i = 0; i < t.length; i++) anteriores.push(specs.length - t.length + i);
  }
}

/** escolhe modos (CR 700.2): só modos com alvos possíveis podem ser escolhidos */
export function* chooseModes(g: G, player: PlayerId, ms: ModeSpec, source: ObjId, label: string, forceMax?: number, event?: Record<string, unknown>): Gen<number[] | null> {
  const ctx: SCtx = { g, you: player, source };
  const items = ms.modes.map((m, i) => {
    const possible = (m.targets ?? []).every((t) => (t.min ?? 1) === 0 || candidateTargets(g, t, player, source, event).length >= (t.min ?? 1));
    return { id: String(i), label: m.text, disabled: !possible || (ms.available ? !ms.available(ctx, i) : false) };
  });
  // "você pode escolher o mesmo modo mais de uma vez" (CR 700.2d): uma escolha por vez, exatamente `max` modos
  if (ms.repeat) {
    const total = forceMax ?? (typeof ms.max === 'function' ? ms.max(ctx) : ms.max);
    if (!items.some((i) => !i.disabled)) return null;
    const escolhidos: number[] = [];
    for (let k = 1; k <= total; k++) {
      const [id] = yield* chooseItems(g, player, `${label}: escolha o modo ${k} de ${total} (pode repetir)`, items, 1, 1);
      escolhidos.push(Number(id));
    }
    escolhidos.sort((x, y) => x - y);
    ms.onChosen?.(ctx, escolhidos);
    return escolhidos;
  }
  const avail = items.filter((i) => !i.disabled).length;
  const max = Math.min(forceMax ?? (typeof ms.max === 'function' ? ms.max(ctx) : ms.max), avail);
  if (avail < ms.min) return null;
  if (ms.counts) {
    // CR 700.2: "escolha zero ou dois" — só as quantidades listadas
    const ok = ms.counts.filter((n) => n <= max);
    if (ok.length === 0) return null;
    const lo = Math.min(...ok);
    const hi = Math.max(...ok);
    const valida = (a: Answer) => (a.kind === 'select' && !ok.includes(a.ids.length) ? `Escolha ${ok.join(' ou ')} modo(s)` : null);
    const r = yield* ask<Extract<Answer, { kind: 'select' }>>(g, { kind: 'select', player, prompt: `${label}: escolha ${ok.join(' ou ')} modo(s)`, items, min: lo, max: hi }, valida);
    const escolhidos = r.ids.map(Number).sort((a, b) => a - b);
    ms.onChosen?.(ctx, escolhidos);
    return escolhidos;
  }
  const ids = yield* chooseItems(g, player, `${label}: escolha ${ms.min === max ? max : `de ${ms.min} a ${max}`} modo(s)`, items, ms.min, max);
  const escolhidos = ids.map(Number).sort((a, b) => a - b);
  ms.onChosen?.(ctx, escolhidos);
  return escolhidos;
}

// ---------------------------------------------------------------------------
// Custo total (CR 601.2f)
// ---------------------------------------------------------------------------
export interface CastMethod {
  key: string;
  label: string;
  /** face ou metade conjurada (CR 709.3, 712.11b, 715.3; FACE_AMBAS = fundida, 702.102a); ausente = a de sempre */
  face?: number;
  /** rótulo completo da ação ("Conjurar Locthwain Scorn (aventura)"); ausente = "<label>: <nome>" */
  title?: string;
  /** zona de onde a carta é conjurada */
  zone: ZoneName;
  alt?: AltCastDef;
  permission?: CastPermission;
  free?: boolean;
  /** durante a resolução de outra mágica (CR 608.2g): sem prioridade depois */
  duringResolution?: boolean;
}

export function commanderTax(g: G, player: PlayerId, o: GameObject): number {
  if (o.card === null) return 0;
  return 2 * (g.state.players[player].commanderCasts[String(o.card)] ?? 0); // CR 903.8
}

/**
 * Custos adicionais de uma mágica: os da face e os concedidos por outros permanentes ("a primeira mágica instantânea
 * ou feitiço que você conjura em cada turno tem baixa 2", Anhelo, the Painter; CR 601.2b, 601.2f).
 */
export function custosAdicionais(g: G, player: PlayerId, spell: ObjId, f: FaceDef | undefined): AdditionalCostDef[] {
  const dados = hooks(g, 'grantedAdditionalCosts').flatMap((h) => h.fn(h.ctx, player, spell) ?? []);
  return dados.length ? [...(f?.additionalCosts ?? []), ...dados] : f?.additionalCosts ?? [];
}

export function totalSpellCost(g: G, player: PlayerId, o: GameObject, method: CastMethod, info: { x: number; targets: TargetRef[][]; paid: Record<string, number | boolean> }): ManaSymbol[] {
  const f = faceDefFor(o, method);
  // a da face escolhida; a mágica fundida custa as duas metades (CR 702.102c), o custo de mana das duas juntas
  const c = castChars(g, player, o, method);
  let cost: ManaSymbol[];
  if (method.free || method.permission?.free) cost = [];
  else if (method.permission?.mana) cost = parseCost(method.permission.mana);
  else if (method.alt?.useManaCost) cost = c.manaCost ? [...c.manaCost] : []; // retraçar (CR 702.81a)
  else if (method.alt) cost = method.alt.mana === null ? [] : parseCost(method.alt.mana);
  else cost = c.manaCost ? [...c.manaCost] : [];
  // CR 107.3b: sem pagar o custo de mana, X só pode ser 0
  cost = withX(cost, info.x);
  // custos adicionais de mana (kicker, replicar…)
  for (const ac of custosAdicionais(g, player, o.id, f)) {
    const times = typeof info.paid[ac.key] === 'number' ? (info.paid[ac.key] as number) : info.paid[ac.key] ? 1 : 0;
    const useOr = info.paid[`${ac.key}:or`] === true;
    const parts = useOr ? ac.orParts ?? [] : ac.parts;
    for (let i = 0; i < times; i++) cost = withX([...cost, ...manaPart(parts)], 0);
  }
  if (method.zone === 'command') cost = addGeneric(cost, commanderTax(g, player, o));
  // aumentos e reduções (CR 601.2f): primeiro aumentos, depois reduções
  let reduce = 0, increase = 0;
  if (f?.selfCost) {
    const r = f.selfCost({ g, you: player, source: o.id }, { targets: info.targets, x: info.x });
    reduce += r.reduce ?? 0; increase += r.increase ?? 0;
    if (r.add) cost = [...cost, ...parseCost(r.add)];
  }
  for (const h of hooks(g, 'costModifier')) {
    const r = h.fn(h.ctx, { obj: o.id, controller: player, chars: c, targets: info.targets, castFrom: method.zone, method: method.key });
    if (r) { reduce += r.reduce ?? 0; increase += r.increase ?? 0; }
  }
  cost = addGeneric(cost, increase);
  cost = reduceGeneric(cost, reduce);
  return cost;
}

// ---------------------------------------------------------------------------
// Conjurar (CR 601.2)
// ---------------------------------------------------------------------------
/** o estado antes de conjurar ou ativar, para voltar se a pessoa cancelar (a LKI fica compartilhada: cloneState) */
function snapshot(g: G): GameState {
  return cloneState(g.state);
}

function restore(g: G, snap: GameState): void {
  const seq = Math.max(g.state.decisionSeq, snap.decisionSeq);
  g.state = snap;
  g.state.decisionSeq = seq;
  g.derived = null;
  g.bump();
}

export function* castSpell(g: G, player: PlayerId, cardId: ObjId, method: CastMethod): Gen<ObjId | null> {
  const snap = snapshot(g);
  const res = yield* castInner(g, player, cardId, method);
  if (res === null) { restore(g, snap); return null; }
  return res;
}

function* castInner(g: G, player: PlayerId, cardId: ObjId, method: CastMethod): Gen<ObjId | null> {
  const orig = g.state.objects[cardId];
  if (!orig) return null;
  // carta de várias faces conjurada por um efeito ("conjure-a sem pagar"): escolhe a face antes de pô-la na pilha
  // (CR 709.3, 712.11b, 715.3)
  if (method.face === undefined && !orig.copyOf && temVariasFaces(orig.def)) {
    const faces = facesConjuraveis(orig.def, orig.zone).filter((f) => f !== FACE_AMBAS || method.zone === 'hand');
    if (faces.length === 0) return null;
    let face = faces[0];
    if (faces.length > 1) {
      const [r] = yield* chooseItems(g, player, `${nameOf(g, cardId)}: escolha o que conjurar`, faces.map((f) => ({ id: String(f), label: rotuloConjurar(orig.def, f), card: { def: orig.def, face: f } })), 1, 1);
      face = Number(r);
    }
    method = { ...method, face };
  }
  const f0 = faceDefFor(orig, method);
  // 601.2a: a carta vai para a pilha e vira mágica
  let spellId: ObjId;
  if (orig.isCopy && orig.zone === 'exile') {
    // cópia preparada (CR 722.3c) ou cópia de carta que se pode conjurar (707.12)
    const sp = createObject(g, { def: orig.def, owner: player, controller: player, zone: 'stack', isCopy: true, copyOf: orig.copyOf, face: orig.copyOf?.face ?? 0 });
    spellId = sp.id;
    const preparedBy = orig.data.preparedBy as ObjId | undefined;
    destroyObject(g, cardId);
    if (preparedBy !== undefined && g.state.objects[preparedBy]) { g.state.objects[preparedBy].prepared = false; g.bump(); }
  } else {
    // morph (CR 702.37c, 708.4): virada para baixo antes de ir para a pilha
    spellId = moveRaw(g, cardId, 'stack', { controller: player, faceDown: !!method.alt?.faceDown, face: method.face ?? 0 });
  }
  const o = g.state.objects[spellId];
  const label = nameOf(g, spellId);
  const info: StackInfo = { kind: 'spell', controller: player, modes: [], targets: [], x: 0, paid: {}, method: method.key, castFrom: method.zone, data: {}, isCopy: o.isCopy };
  o.stack = info;
  o.controller = player;
  if (method.alt?.exileAfter) info.data.exileOnLeave = true; // flashback (CR 702.34a)
  // aftermath conjurada do cemitério: exilada ao sair da pilha (CR 702.127a)
  if (method.zone === 'graveyard' && !o.copyOf && metadeAftermath(o.def) === o.face) info.data.exileOnLeave = true;
  // conjurada como aventura: vai para o exílio ao resolver (CR 715.3d)
  if (!o.copyOf && ehAventura(o.def) && o.face === 1) info.data.adventure = true;
  if (method.permission?.bottomInstead) info.data.bottomInsteadOfGraveyard = true;
  if (method.permission?.exileInstead) info.data.exileInsteadOfGraveyard = true;
  if (method.key === 'bestow') info.data.bestow = true;
  g.bump();
  // virada para baixo, a mágica não tem texto: sem modos, alvos nem custos adicionais (CR 708.2a)
  const f = o.faceDown || (o.face === FACE_AMBAS && !o.copyOf) ? undefined : faceDefOf(o) ?? f0;
  const sp: SpellDef | undefined = f?.spell;
  // 601.2b: modos, custos adicionais/alternativos, X
  if (sp?.modes) {
    const modes = yield* chooseModes(g, player, sp.modes, spellId, label);
    if (modes === null) return null;
    info.modes = modes;
  }
  // Gift (CR 702.174a): custo adicional opcional de escolher um oponente que vai receber o presente
  if (f?.gift) {
    const ops = g.opponents(player).filter((p) => !g.state.players[p].left);
    // prometido, os alvos da parte do presente passam a ser obrigatórios (CR 702.174m): sem alvo, não dá para prometer
    const semAlvo = (sp?.targets ?? []).some((t) => t.gift && candidateTargets(g, t, player, spellId).length < (t.min ?? 1));
    if (ops.length) {
      const [r] = yield* chooseItems(g, player, `${label}: prometer ${f.gift.label} de presente a um oponente?`, [
        { id: 'nao', label: 'Não prometer' },
        ...ops.map((p) => ({ id: String(p), label: `Prometer a ${g.state.players[p].name}${semAlvo ? ' (sem alvo para a parte do presente)' : ''}`, disabled: semAlvo })),
      ], 1, 1);
      if (r !== 'nao') { info.paid.gift = true; info.data.giftTo = Number(r); }
    }
  }
  for (const ac of custosAdicionais(g, player, spellId, f)) {
    // escalada (CR 702.120a): uma vez para cada modo além do primeiro, sem escolha
    if (ac.perExtraMode) { info.paid[ac.key] = Math.max(0, info.modes.length - 1); continue; }
    if (ac.repeatable) {
      // não dá para repetir mais vezes do que é possível pagar (sacrificar: quantos permanentes servem)
      let vezes = 10;
      if (ac.capByMana) {
        const porVez = manaValueOf(manaPart(ac.parts), 0);
        if (porVez > 0) vezes = Math.min(vezes, Math.max(0, Math.floor((maxX(g, player, spellId) - 2) / porVez)));
      }
      for (const p of ac.parts) {
        if (p.k !== 'sacrifice' || typeof p.n !== 'number' || p.n <= 0) continue;
        const ctx = { g, you: player, source: spellId };
        const servem = g.state.zones.battlefield.filter((id) => controllerOf(g, id) === player && id !== spellId && p.filter(ctx, id)).length;
        vezes = Math.min(vezes, Math.floor(servem / p.n));
      }
      const n = yield* chooseNumber(g, player, `${label}: quantas vezes pagar ${ac.label}?`, ac.optional ? 0 : Math.min(1, vezes), Math.max(ac.optional ? 0 : 1, vezes));
      info.paid[ac.key] = n;
    } else if (ac.optional) {
      const items = [{ id: 'no', label: 'Não pagar' }, { id: 'yes', label: `Pagar: ${ac.label}` }];
      if (ac.orParts) items.push({ id: 'or', label: `Pagar: ${ac.orLabel}` });
      const [r] = yield* chooseItems(g, player, `${label}: custo adicional opcional`, items.map((i) => ({ ...i, disabled: (i.id === 'yes' && !canPayParts(g, player, ac.parts.filter((p) => p.k !== 'mana'), spellId)) })), 1, 1);
      info.paid[ac.key] = r !== 'no';
      if (r === 'or') info.paid[`${ac.key}:or`] = true;
    } else if (ac.orParts) {
      const canA = canPayParts(g, player, ac.parts.filter((p) => p.k !== 'mana'), spellId, 0);
      const [r] = yield* chooseItems(g, player, `${label}: custo adicional`, [
        { id: 'yes', label: ac.label, disabled: !canA }, { id: 'or', label: ac.orLabel ?? 'alternativa' },
      ], 1, 1);
      info.paid[ac.key] = true;
      if (r === 'or') info.paid[`${ac.key}:or`] = true;
    } else info.paid[ac.key] = true;
  }
  // X do custo impresso ou do custo alternativo (madness {X}{R}: Avacyn's Judgment)
  const manaHasX = (chars(g, spellId).manaCost ?? []).some((s) => s.k === 'X') || (!!method.alt?.mana && parseCost(method.alt.mana).some((s) => s.k === 'X'));
  const otherHasX = !!sp?.xMax || (custosAdicionais(g, player, spellId, f)).some((ac) => ac.parts.some((p) => (p.k === 'life' || p.k === 'sacrifice' || p.k === 'blight') && (p as { n: unknown }).n === 'X'));
  const free = !!(method.free || method.permission?.free);
  // CR 107.3b: sem pagar o custo de mana, o X do custo de mana só pode ser 0; X de custos
  // adicionais (pagar X de vida, sacrificar X…) continua sendo escolhido (ruling de Toxic Deluge)
  if ((manaHasX && !free) || (otherHasX && !manaHasX)) {
    const cap = sp?.xMax ? sp.xMax({ g, you: player, source: spellId }) : maxX(g, player, spellId);
    info.x = yield* chooseNumber(g, player, `${label}: escolha o valor de X`, 0, Math.max(0, cap));
  }
  // 601.2c: alvos
  const { specs } = spellTargetSpecs(o, info.modes, method.key);
  if (specs.length) {
    const t = yield* chooseTargets(g, player, specs, spellId, label, info.x);
    if (t === null) return null;
    info.targets = t;
  }
  // 601.2d: divisão
  if (sp?.divide) {
    const total = sp.divide({ g, you: player, source: spellId, x: info.x });
    const tg = info.targets[0] ?? [];
    if (tg.length === 1) info.division = [[total]];
    else if (tg.length > 1) {
      const div: number[] = [];
      let left = total;
      for (let i = 0; i < tg.length; i++) {
        const remainingTargets = tg.length - i - 1;
        const n = i === tg.length - 1 ? left : yield* chooseNumber(g, player, `${label}: quanto para ${targetLabel(g, tg[i])}? (restam ${left})`, 1, left - remainingTargets);
        div.push(n);
        left -= n;
      }
      info.division = [div];
    }
  }
  // 601.2e: legalidade (proibições, CR 601.3)
  if (hooks(g, 'cantCastSpells').some((h) => h.fn(h.ctx, player))) return null;
  // 601.2f: custo total
  let cost = totalSpellCost(g, player, o, method, info);
  // Delve (CR 702.66a): exilar cartas do cemitério paga genérico, ao pagar o custo total
  if (f?.delve) {
    const generico = cost.reduce((t, s) => t + (s.k === 'generic' ? s.n : 0), 0);
    const cem = g.state.zones.graveyard[player];
    const max = Math.min(generico, cem.length);
    if (max > 0) {
      const n = yield* chooseNumber(g, player, `Delve: quantas cartas do cemitério exilar para pagar o genérico de ${label}?`, 0, max);
      if (n > 0) {
        const ids = yield* chooseItems(g, player, `Delve: escolha ${n} carta(s) do seu cemitério para exilar`, cem.map((id) => objItem(g, id, nameOf(g, id))), n, n);
        yield* moveObjects(g, ids.map((i) => ({ id: Number(i), to: 'exile' as ZoneName })), 'delve', player);
        cost = reduceGeneric(cost, n);
      }
    }
  }
  // Convoke (CR 702.51a): virar criaturas suas paga {1} ou uma mana da cor de cada uma, depois do custo total (ruling)
  if (f?.convoke || hooks(g, 'spellsHaveConvoke').some((h) => h.fn(h.ctx, player, spellId, chars(g, spellId)))) {
    const criaturas = g.state.zones.battlefield.filter((id) => controllerOf(g, id) === player && isType(g, id, 'Creature') && !g.state.objects[id].tapped);
    const ajudam = criaturas.filter((id) => convokeOne(cost, colorsOf(g, id)) !== null);
    if (ajudam.length) {
      const total = cost.reduce((t, s) => t + (s.k === 'generic' ? s.n : s.k === 'X' ? 0 : 1), 0);
      const ids = yield* chooseItems(g, player, `Convocar: vire criaturas suas para ajudar a pagar ${label} (cada uma paga {1} ou uma mana da cor dela)`,
        ajudam.map((id) => objItem(g, id, nameOf(g, id))), 0, Math.min(ajudam.length, total));
      // as de uma cor só pagam primeiro (as de várias cores ficam para o que sobrar)
      const escolhidas = ids.map(Number).sort((a, b) => colorsOf(g, a).length - colorsOf(g, b).length);
      for (const id of escolhidas) {
        const novo = convokeOne(cost, colorsOf(g, id));
        if (!novo) continue;
        cost = novo;
        tap(g, id);
        // "cada criatura que convocou esta mágica" (Lethal Scheme)
        info.data.convoked = [...((info.data.convoked as ObjId[] | undefined) ?? []), id];
      }
    }
  }
  // 601.2g-h: mana, depois as outras partes
  const pay: PayContext & { canCancel: boolean; label: string } = { purpose: { kind: 'spell', obj: spellId }, canCancel: true, label, anyType: method.permission?.anyType, improvise: f?.improvise };
  const paidMana = yield* payMana(g, player, cost, pay);
  if (paidMana === null) return null;
  const otherParts = [
    ...(method.alt?.parts ?? []), ...(method.permission?.parts ?? []),
    ...(custosAdicionais(g, player, spellId, f)).flatMap((ac) => {
      const times = typeof info.paid[ac.key] === 'number' ? (info.paid[ac.key] as number) : info.paid[ac.key] ? 1 : 0;
      const parts = (info.paid[`${ac.key}:or`] ? ac.orParts ?? [] : ac.parts).filter((p) => p.k !== 'mana');
      // escalada: "vire uma criatura" duas vezes é virar duas criaturas de uma vez (o mesmo recurso não paga duas)
      if (ac.perExtraMode) return times > 0 ? parts.map((p) => ('n' in p && typeof p.n === 'number' ? { ...p, n: p.n * times } as typeof p : p)) : [];
      return Array.from({ length: times }, () => parts).flat();
    }),
  ];
  if (otherParts.length) {
    const r = yield* payParts(g, player, otherParts, spellId, info.x);
    if (r === false) return null;
    Object.assign(info.data, { costInfo: r });
    // sneak (CR 702.190b): a permanente vai entrar atacando quem o atacante devolvido atacava
    const devolvido = r.returnedAttacker as { target: TargetRef | null } | undefined;
    if (method.alt?.enterAttacking && devolvido?.target) info.data.enterAttacking = devolvido.target;
  }
  const byType: Record<string, number> = {};
  for (const u of paidMana.units) byType[u.type] = (byType[u.type] ?? 0) + 1;
  info.manaSpent = { total: paidMana.units.length, byType, colors: Object.keys(byType).filter((t) => t !== 'C').length };
  if (paidMana.lifePaid) info.paid.phyrexianLife = paidMana.lifePaid;
  // 601.2i: a mágica foi conjurada
  if (method.zone === 'command' && o.card !== null) {
    const k = String(o.card);
    g.state.players[player].commanderCasts[k] = (g.state.players[player].commanderCasts[k] ?? 0) + 1;
  }
  method.permission?.onUse?.({ g, you: player, source: spellId }, spellId);
  const st = g.state.turnStats[player];
  st.spellsCast++;
  const c = chars(g, spellId);
  if (!c.types.includes('Creature')) st.noncreatureSpellsCast = (st.noncreatureSpellsCast ?? 0) + 1;
  st.spellColorsCast = [...new Set([...(st.spellColorsCast ?? []), ...c.colors])];
  st.castLog = [...(st.castLog ?? []), { types: [...c.types], subtypes: [...c.subtypes] }];
  // "a próxima mágica do tipo escolhido": a permissão de lampejo acaba quando essa mágica é conjurada, com ou sem lampejo
  for (const e of [...g.state.effects]) {
    if (e.mods.some((m) => m.k === 'rule' && m.id === 'rule:flashNext' && m.params?.player === player && c.subtypes.includes(m.params?.tipo as string))) removeEffect(g, e.id);
  }
  if (c.types.includes('Instant') || c.types.includes('Sorcery')) {
    st.instantSorceryCast++;
    st.greatestInstantSorceryMV = Math.max(st.greatestInstantSorceryMV, c.manaValue);
  }
  g.bump();
  const textoConjura = `${g.state.players[player].name} conjura ${label}${info.targets.flat().length ? ` (alvos: ${info.targets.flat().map((t) => targetLabel(g, t)).join(', ')})` : ''}.`;
  // virada para baixo, só quem conjura sabe qual é (CR 708.5)
  if (o.faceDown) g.log(textoConjura, { rule: '702.37c', visibleTo: [player], hiddenText: `${g.state.players[player].name} conjura uma criatura virada para baixo.` });
  else g.log(textoConjura, { rule: '601.2' });
  const events: Parameters<typeof emit>[1] = [{ type: 'cast', obj: spellId, player, from: method.zone, copy: false }];
  for (const t of info.targets.flat()) events.push({ type: 'target', target: t, by: spellId, controller: player, spell: true });
  emit(g, events);
  return spellId;
}

/** maior X que o jogador talvez consiga pagar (só para limitar a escolha) */
function maxX(g: G, player: PlayerId, spellId: ObjId): number {
  const pool = g.state.players[player].manaPool.length;
  const sources = manaOptions(g, player);
  const perObj = new Map<ObjId, number>();
  for (const s of sources) perObj.set(s.obj, Math.max(perObj.get(s.obj) ?? 0, s.alt.length));
  let total = pool;
  for (const v of perObj.values()) total += v;
  const base = manaValueOf(chars(g, spellId).manaCost, 0);
  return Math.max(0, total - base + 2);
}

// ---------------------------------------------------------------------------
// Ativar habilidades (CR 602)
// ---------------------------------------------------------------------------
export function* activateAbility(g: G, player: PlayerId, sourceId: ObjId, abilityId: string): Gen<ObjId | null> {
  const snap = snapshot(g);
  const res = yield* activateInner(g, player, sourceId, abilityId);
  if (res === null) { restore(g, snap); return null; }
  return res;
}

function* activateInner(g: G, player: PlayerId, sourceId: ObjId, abilityId: string): Gen<ObjId | null> {
  const def = ability(abilityId) as ActivatedDef;
  const src = g.state.objects[sourceId];
  if (!src) return null;
  const label = `${nameOf(g, sourceId)}${def.kw ? ` (${def.kw})` : ''}`;
  // 602.2a: a habilidade vai para a pilha
  const ab = createObject(g, { def: '', owner: player, controller: player, zone: 'stack' });
  const info: StackInfo = { kind: 'activated', controller: player, abilityId, source: sourceId, modes: [], targets: [], x: 0, paid: {}, data: {}, isCopy: false };
  ab.stack = info;
  // 601.2b
  if (def.modes) {
    const modes = yield* chooseModes(g, player, def.modes, sourceId, label);
    if (modes === null) return null;
    info.modes = modes;
  }
  const mp = manaPart(def.cost);
  const hasX = mp.some((s) => s.k === 'X') || def.cost.some((p) => (p.k === 'loyalty' && p.n === 'X') || (p.k === 'sacrifice' && p.n === 'X')) || !!def.xMax;
  if (hasX) {
    const cap = def.xMax ? def.xMax({ g, you: player, source: sourceId }) : 20;
    info.x = yield* chooseNumber(g, player, `${label}: escolha o valor de X`, 0, Math.max(0, cap));
  }
  // 601.2c
  const { specs } = abilityTargetSpecs(def, info.modes);
  if (specs.length) {
    const t = yield* chooseTargets(g, player, specs, sourceId, label, info.x);
    if (t === null) return null;
    info.targets = t;
  }
  // 601.2f-h
  const cost = totalAbilityCost(g, player, sourceId, def, info.x);
  // a fonte que vai ser virada/sacrificada no custo não pode também pagar a mana
  const usesSource = def.cost.some((p) => p.k === 'tap' || p.k === 'untap' || p.k === 'sacrificeSelf' || p.k === 'exileSelf');
  const paid = yield* payMana(g, player, cost, { purpose: { kind: 'ability', obj: ab.id }, canCancel: true, label, excludeSource: usesSource ? sourceId : undefined });
  if (paid === null) return null;
  const parts = def.cost.filter((p) => p.k !== 'mana');
  const r = yield* payParts(g, player, parts, sourceId, info.x);
  if (r === false) return null;
  info.data.costInfo = r;
  const s0 = g.state.objects[sourceId];
  if (s0) {
    if (def.oncePerTurn) s0.usedThisTurn[abilityId] = g.state.turn.number;
    if (def.cost.some((p) => p.k === 'loyalty')) s0.usedThisTurn['loyalty'] = g.state.turn.number; // CR 606.3
  }
  g.bump();
  g.log(`${g.state.players[player].name} ativa ${label}${info.targets.flat().length ? ` (alvos: ${info.targets.flat().map((t) => targetLabel(g, t)).join(', ')})` : ''}.`, { rule: '602.2' });
  const events: Parameters<typeof emit>[1] = [{ type: 'activate', obj: ab.id, source: sourceId, player, abilityId }];
  for (const t of info.targets.flat()) events.push({ type: 'target', target: t, by: ab.id, controller: player, spell: false });
  emit(g, events);
  return ab.id;
}

/** pode ativar esta habilidade agora? (sem contar mana) */
export function canActivate(g: G, player: PlayerId, sourceId: ObjId, def: ActivatedDef, timingOk: { sorcery: boolean }): boolean {
  const o = g.state.objects[sourceId];
  if (!o) return false;
  const zones = def.zones ?? ['battlefield'];
  if (!zones.includes(o.zone)) return false;
  const owner = o.zone === 'battlefield' ? controllerOf(g, sourceId) : o.owner;
  if (def.activator === 'opponents') { if (!g.isOpponent(owner, player)) return false; }
  else if (owner !== player) return false;
  if (def.timing === 'sorcery' && !timingOk.sorcery) return false;
  if (def.cost.some((p) => p.k === 'loyalty')) {
    if (!timingOk.sorcery) return false; // CR 606.3
    if (o.usedThisTurn['loyalty'] === g.state.turn.number) return false;
  }
  if (def.oncePerTurn && o.usedThisTurn[def.id!] === g.state.turn.number) return false;
  if (def.condition && !def.condition({ g, you: player, source: sourceId })) return false;
  if (!canPayParts(g, player, def.cost.filter((p) => p.k !== 'mana'), sourceId, 0)) return false;
  // precisa ter alvos possíveis
  const { specs } = abilityTargetSpecs(def, []);
  if (specs.some((sp) => (sp.min ?? 1) > 0 && candidateTargets(g, sp, player, sourceId).length < (sp.min ?? 1))) return false;
  const mp = totalAbilityCost(g, player, sourceId, def, 0);
  const usesSource = def.cost.some((p) => p.k === 'tap' || p.k === 'untap' || p.k === 'sacrificeSelf' || p.k === 'exileSelf');
  if (mp.length && !canAfford(g, player, mp, { purpose: { kind: 'ability', obj: sourceId }, excludeSource: usesSource ? sourceId : undefined })) return false;
  return true;
}

/** CR 602.2b, 601.2f: determine uma vez o custo total, antes de ativar habilidades de mana ou pagar partes. */
export function totalAbilityCost(g: G, player: PlayerId, source: ObjId, def: ActivatedDef, x: number): ManaSymbol[] {
  const adjustment = def.selfCost?.({ g, you: player, source }, x);
  return reduceGeneric(addGeneric(withX(manaPart(def.cost), x), adjustment?.increase ?? 0), adjustment?.reduce ?? 0);
}

// ---------------------------------------------------------------------------
// Gatilhos para a pilha (CR 603.3)
// ---------------------------------------------------------------------------
export function* putTriggersOnStack(g: G): Gen<void> {
  const pending = g.state.pendingTriggers;
  g.state.pendingTriggers = [];
  if (pending.length === 0) return;
  for (const p of g.apnap()) {
    const mine = pending.filter((t) => t.controller === p).sort((a, b) => a.seq - b.seq);
    if (mine.length === 0) continue;
    let order = mine;
    const distinct = new Set(mine.map((t) => `${t.abilityId}|${t.source}`));
    if (mine.length > 1 && distinct.size > 1) {
      const items = mine.map((t, i) => ({ id: String(i), label: triggerLabel(g, t.abilityId, t.source) }));
      const ids = yield* chooseItems(g, p, 'Ordene seus gatilhos: o primeiro vai para a pilha primeiro (resolve por último)', items, mine.length, mine.length, true);
      order = ids.map((id) => mine[Number(id)]);
    }
    for (const t of order) {
      if (g.state.players[t.controller].left) continue; // CR 800.4d
      yield* putTriggerOnStack(g, t.abilityId, t.source, t.controller, t.event, t.data);
    }
  }
}

export function triggerLabel(g: G, abilityId: string, source: ObjId): string {
  const name = g.state.objects[source] ? nameOf(g, source) : g.state.lki[source]?.chars.name ?? 'regra do jogo';
  const def = registry.abilities.get(abilityId);
  return `${name}${def?.text ? `: ${def.text}` : ''}`;
}

export function* putTriggerOnStack(g: G, abilityId: string, source: ObjId, controller: PlayerId, event: Record<string, unknown>, data: Record<string, unknown>): Gen<ObjId | null> {
  const def = registry.abilities.get(abilityId) as TriggeredDef | undefined;
  if (!def) return null;
  const ab = createObject(g, { def: '', owner: controller, controller, zone: 'stack' });
  const info: StackInfo = { kind: 'triggered', controller, abilityId, source, modes: [], targets: [], x: 0, paid: {}, event, data: { ...data }, isCopy: false };
  ab.stack = info;
  const label = triggerLabel(g, abilityId, source);
  if (def.modes) {
    const modes = yield* chooseModes(g, controller, def.modes, source, label, undefined, event);
    if (modes === null || modes.length === 0) { destroyObject(g, ab.id); return null; } // CR 603.3c
    info.modes = modes;
  }
  const { specs } = abilityTargetSpecs(def, info.modes);
  if (specs.length) {
    const t = yield* chooseTargets(g, controller, specs, source, label, 0, event);
    if (t === null) { destroyObject(g, ab.id); return null; } // CR 603.3d
    info.targets = t;
  }
  g.bump();
  const events: Parameters<typeof emit>[1] = [];
  for (const t of info.targets.flat()) events.push({ type: 'target', target: t, by: ab.id, controller, spell: false });
  emit(g, events);
  return ab.id;
}

/**
 * CR 707.10: copia uma habilidade ativada ou desencadeada que está na pilha. A cópia tem a mesma fonte (707.10b), os
 * mesmos modos, alvos e dados do evento; com newTargets, o controlador pode escolher novos alvos (707.10c).
 */
export function* copyStackAbility(g: G, abId: ObjId, controller: PlayerId, opts: { newTargets?: boolean } = {}): Gen<ObjId | null> {
  const o = g.state.objects[abId];
  if (!o || o.zone !== 'stack' || !o.stack || o.stack.kind === 'spell' || !o.stack.abilityId) return null;
  const st = o.stack;
  const def = registry.abilities.get(st.abilityId!) as ActivatedDef | TriggeredDef | undefined;
  if (!def) return null;
  const source = st.source ?? abId;
  const copia = createObject(g, { def: '', owner: controller, controller, zone: 'stack' });
  copia.stack = { ...structuredClone(st), controller, isCopy: true };
  const label = `cópia de ${triggerLabel(g, st.abilityId!, source)}`;
  g.log(`${g.state.players[controller].name} copia a habilidade de ${triggerLabel(g, st.abilityId!, source)}.`, { rule: '707.10' });
  if (opts.newTargets && st.targets.flat().length > 0) {
    const { specs } = abilityTargetSpecs(def, st.modes);
    if (specs.length && (yield* yesNo(g, controller, `Escolher novos alvos para a ${label}?`))) {
      const novos = yield* chooseTargets(g, controller, specs, source, label, st.x, st.event);
      if (novos) copia.stack.targets = novos;
    }
  }
  g.bump();
  const evs: GameEvent[] = [];
  for (const t of copia.stack.targets.flat()) evs.push({ type: 'target', target: t, by: copia.id, controller, spell: false });
  emit(g, evs);
  return copia.id;
}

// ---------------------------------------------------------------------------
// Resolução (CR 608)
// ---------------------------------------------------------------------------
function makeCtx(g: G, o: GameObject, targets: (TargetRef | null)[][], source: ObjId): Ctx {
  const st = o.stack!;
  return {
    g, you: st.controller, self: o.id, source, targets, x: st.x, modes: st.modes, paid: st.paid,
    event: st.event ?? {}, data: st.data, division: st.division, method: st.method, castFrom: st.castFrom, manaSpent: st.manaSpent,
  };
}

/** checa alvos na resolução (CR 608.2b). Devolve null se todos ficaram ilegais */
function checkTargets(g: G, o: GameObject, specs: TargetSpec[], source: ObjId): (TargetRef | null)[][] | null {
  const st = o.stack!;
  if (specs.length === 0 || st.targets.flat().length === 0) return st.targets.map((grp) => [...grp]);
  const res = st.targets.map((grp, i) => grp.map((t) => (specs[i] && isLegalTarget(g, specs[i], t, st.controller, source, true, st.kind === 'triggered' ? st.event : undefined) ? t : null)));
  const any = st.targets.flat().length > 0;
  const allIllegal = any && res.flat().every((t) => t === null);
  return allIllegal ? null : res;
}

export function* resolveTop(g: G): Gen<void> {
  const s = g.state;
  const id = s.zones.stack[s.zones.stack.length - 1];
  const o = s.objects[id];
  const st = o.stack!;
  if (st.kind !== 'spell') {
    const def = registry.abilities.get(st.abilityId!) as ActivatedDef | TriggeredDef | undefined;
    if (!def) { destroyObject(g, id); return; }
    // 608.2a: cláusula "se" interveniente
    if (def.kind === 'triggered' && def.condition && !def.condition({ g, you: st.controller, source: st.source!, event: st.event ?? {} })) {
      destroyObject(g, id);
      return;
    }
    const { specs, groups } = abilityTargetSpecs(def, st.modes);
    const targets = checkTargets(g, o, specs, st.source!);
    if (targets === null) {
      g.log(`${triggerLabel(g, st.abilityId!, st.source!)} não resolve: alvos ilegais.`, { rule: '608.2b' });
      destroyObject(g, id);
      return;
    }
    const ctx = makeCtx(g, o, targets, st.source!);
    if (def.modes) {
      for (const grp of groups) {
        if (grp.mode === null) continue;
        const mctx = { ...ctx, targets: targets.slice(grp.start, grp.start + grp.count) };
        yield* def.modes.modes[grp.mode].effect(mctx);
      }
      // modo sem alvos não aparece em groups com count 0? aparece (count 0); já executado acima
    } else yield* def.effect(ctx);
    if (g.state.objects[id]) destroyObject(g, id); // 608.2n
    emit(g, [{ type: 'resolved', obj: id, abilityId: st.abilityId, controller: st.controller }]);
    return;
  }
  // mágica
  const c = chars(g, id);
  const isPermanent = !c.types.includes('Instant') && !c.types.includes('Sorcery');
  const { specs, groups } = spellTargetSpecs(o, st.modes, st.method);
  if (isPermanent) {
    let attachTo: ObjId | null = null;
    let jogadorEncantado: PlayerId | null = null;
    if (specs.length) {
      const targets = checkTargets(g, o, specs, id);
      const auraTarget = targets?.[targets.length - 1]?.[0];
      if (!targets || !auraTarget) {
        if (st.data.bestow) {
          st.data.bestow = false; // CR 702.103e: vira mágica de criatura
          g.bump();
        } else {
          g.log(`${c.name} não resolve: alvo ilegal.`, { rule: '608.3b' });
          yield* moveObject(g, id, 'graveyard', 'fizzle');
          return;
        }
      } else if (auraTarget.kind === 'obj') attachTo = auraTarget.id;
      else if (auraTarget.kind === 'player' && c.subtypes.includes('Aura')) jogadorEncantado = auraTarget.id;
    }
    const spell = { x: st.x, paid: st.paid, method: st.method, manaSpent: st.manaSpent, castFrom: st.castFrom };
    // sneak (CR 702.190b): entra virada e atacando quem o atacante devolvido atacava; só criatura ataca (506.3a), e não
    // ataca um jogador que saiu nem um permanente que não está mais no campo (506.3c)
    const atk = st.data.enterAttacking as TargetRef | undefined;
    const atacaValido = !!atk && !!g.state.combat && g.state.turn.active === st.controller && c.types.includes('Creature') &&
      (atk.kind === 'player' ? !g.state.players[atk.id].left : g.state.objects[atk.id]?.zone === 'battlefield');
    const res = yield* putOntoBattlefield(g, [{
      id, controller: st.controller, attachTo, spell, faceDown: o.faceDown, // morph: entra virada para baixo (CR 702.37c)
      ...(jogadorEncantado !== null ? { data: { auraUnattachedOk: true, enchantedPlayer: jogadorEncantado } } : {}),
      ...(atk ? { tapped: true, attacking: atacaValido ? atk : undefined } : {}),
    }], 'resolve');
    if (res.length === 0 && g.state.objects[id]) yield* moveObject(g, id, 'graveyard', 'resolve'); // CR 608.3e
    // habilidades concedidas à mágica que continuam no permanente (Serra Paragon: "ela ganha …")
    const conceder = st.data.grantOnEnter as string[] | undefined;
    if (conceder?.length && res[0] !== undefined) {
      addEffect(g, { source: res[0], sourceDef: '', controller: st.controller, duration: { kind: 'whileOnBattlefield', obj: res[0] }, affected: [res[0]], mods: conceder.map((a) => ({ k: 'addAbility' as const, id: a })) });
    }
    return;
  }
  const targets = checkTargets(g, o, specs, id);
  if (targets === null) {
    g.log(`${c.name} não resolve: todos os alvos ficaram ilegais.`, { rule: '608.2b' });
    yield* moveObject(g, id, 'graveyard', 'fizzle');
    return;
  }
  const f = faceDefOf(o);
  const sp = f?.spell;
  const ctx = makeCtx(g, o, targets, id);
  // mágica fundida: as instruções da metade da esquerda, depois as da direita (CR 702.102d)
  if (o.face === FACE_AMBAS && !o.copyOf && ehDividida(o.def)) {
    for (const half of [0, 1]) {
      const efeito = cardDef(o.def)?.faces[half]?.spell?.effect;
      const grp = groups.find((x) => x.half === half);
      if (efeito) yield* efeito({ ...ctx, targets: grp ? targets.slice(grp.start, grp.start + grp.count) : [] });
    }
  }
  // Gift (CR 702.174j): o oponente escolhido recebe o presente antes dos outros efeitos da mágica
  const presenteado = st.paid.gift ? (st.data.giftTo as PlayerId | undefined) : undefined;
  if (f?.gift && presenteado !== undefined && !g.state.players[presenteado].left) {
    g.log(`${g.state.players[presenteado].name} recebe o presente de ${c.name}: ${f.gift.label}.`, { rule: '702.174j' });
    yield* f.gift.give(ctx, presenteado);
  }
  if (sp?.effect) {
    const base = groups.find((x) => x.mode === null);
    yield* sp.effect({ ...ctx, targets: base ? targets.slice(base.start, base.start + base.count) : [] });
  }
  if (sp?.modes) {
    // um grupo de alvos por modo escolhido, na ordem (o mesmo modo pode aparecer mais de uma vez: CR 700.2d)
    const porModo = groups.filter((x) => x.mode !== null);
    for (let i = 0; i < st.modes.length; i++) {
      const m = st.modes[i];
      const grp = porModo[i] ?? groups.find((x) => x.mode === m)!;
      yield* sp.modes.modes[m].effect({ ...ctx, targets: targets.slice(grp.start, grp.start + grp.count) });
    }
  }
  // 608.2n: vai para o cemitério do dono (se ainda estiver na pilha)
  if (g.state.objects[id]?.zone === 'stack') {
    if (g.state.objects[id].isCopy) destroyObject(g, id);
    else if (st.data.adventure) {
      // aventura: quem a controla a exila em vez de pô-la no cemitério e pode conjurar a carta enquanto ela ficar
      // exilada (CR 715.3d); essa permissão é só deste exílio (ruling 5)
      const nid = yield* moveObject(g, id, 'exile', 'adventure');
      if (nid !== null && g.state.objects[nid]?.zone === 'exile') { g.state.objects[nid].data.adventureOf = st.controller; g.bump(); }
    }
    else if (st.paid.buyback) yield* moveObject(g, id, 'hand', 'resolve'); // recompra (CR 702.27a)
    else if (st.castFrom === 'hand' && chars(g, id).abilities.some((a) => a.kw === 'rebound')) {
      // ricochete (CR 702.88a): conjurada da mão, vai para o exílio e volta a ser conjurável na sua próxima manutenção
      const novo = yield* moveObject(g, id, 'exile', 'rebound');
      if (novo !== null && g.state.objects[novo]?.zone === 'exile') {
        const s2 = g.state;
        s2.delayedTriggers.push({ id: s2.nextId++, abilityId: 'kw:rebound', source: novo, controller: st.controller, data: {}, once: true, expiresTurn: null, createdTurn: s2.turn.number, createdStep: s2.turn.step });
        g.log(`${c.name} vai para o exílio (ricochete).`, { rule: '702.88a' });
        g.bump();
      }
    } else yield* moveObject(g, id, 'graveyard', 'resolve');
  }
  emit(g, [{ type: 'resolved', obj: id, controller: st.controller }]);
}

/** anula uma mágica ou habilidade (CR 701.6) */
/**
 * Copia uma mágica na pilha (CR 707.10): a cópia tem as mesmas escolhas (modos, X, alvos,
 * custos adicionais pagos, divisão) e é controlada por quem copiou. Se o efeito permitir,
 * quem copiou pode escolher novos alvos (707.10c). Não é conjurada (707.10).
 */
export function* copySpell(g: G, spellId: ObjId, controller: PlayerId, opts: { newTargets?: boolean; extra?: boolean; semExtra?: boolean } = {}): Gen<ObjId | null> {
  // a mágica pode já ter saído da pilha (replicar, CR 702.56: copia mesmo assim, pela última informação)
  const o = g.state.objects[spellId]?.zone === 'stack' ? g.state.objects[spellId] : g.state.lki[spellId]?.obj;
  if (!o || o.stack?.kind !== 'spell') return null;
  const st = o.stack;
  const copia = createObject(g, { def: o.def, owner: controller, controller, zone: 'stack', isCopy: true, copyOf: o.copyOf ? structuredClone(o.copyOf) : null, face: o.face });
  const dados = structuredClone(st.data);
  delete dados.exileOnLeave;
  delete dados.bottomInsteadOfGraveyard;
  delete dados.exileInsteadOfGraveyard;
  // a cópia não foi conjurada (CR 707.10): não tem zona de origem
  copia.stack = { ...structuredClone(st), controller, isCopy: true, data: dados, castFrom: undefined };
  g.log(`${g.state.players[controller].name} copia ${nameOf(g, spellId)}.`, { rule: '707.10' });
  if (opts.newTargets && st.targets.flat().length > 0) {
    const { specs } = spellTargetSpecs(copia, st.modes, st.method);
    if (specs.length && (yield* yesNo(g, controller, `Escolher novos alvos para a cópia de ${nameOf(g, spellId)}?`))) {
      const novos = yield* chooseTargets(g, controller, specs, copia.id, `cópia de ${nameOf(g, spellId)}`, st.x);
      if (novos) copia.stack.targets = novos;
    }
  }
  g.bump();
  const evs: GameEvent[] = [{ type: 'copySpell', obj: copia.id, player: controller }];
  for (const t of copia.stack.targets.flat()) evs.push({ type: 'target', target: t, by: copia.id, controller, spell: true });
  emit(g, evs);
  // "se você fosse copiar uma mágica uma ou mais vezes, copie-a mais uma vez" (Twinning Staff; CR 614.1a): uma cópia
  // adicional por lote de cópias (quem copia várias vezes seguidas passa semExtra a partir da segunda), com novos alvos
  if (!opts.extra && !opts.semExtra) {
    const mais = hooks(g, 'extraSpellCopies').reduce((n, h) => n + h.fn(h.ctx, controller), 0);
    for (let i = 0; i < mais; i++) yield* copySpell(g, spellId, controller, { newTargets: true, extra: true });
  }
  return copia.id;
}

export function* counter(g: G, id: ObjId): Gen<boolean> {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'stack') return false;
  if (o.stack?.kind === 'spell') {
    const f = faceDefOf(o);
    if (f?.cantBeCountered) return false;
    if (hooks(g, 'cantBeCountered').some((h) => h.fn(h.ctx, id))) return false;
    g.log(`${nameOf(g, id)} é anulada.`, { rule: '701.6' });
    if (o.isCopy) destroyObject(g, id);
    else yield* moveObject(g, id, 'graveyard', 'counter');
  } else {
    g.log('Uma habilidade é anulada.', { rule: '701.6' });
    destroyObject(g, id);
  }
  return true;
}

export { addEffect, newTimestamp, printedChars, currentFace, isType, enchantCandidates, abilityDefs, moveObjects, formatCost };
