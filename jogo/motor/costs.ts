// Custos (CR 118) e pagamento de mana (CR 601.2g-h, 605).
// O pagamento é uma decisão: o jogador ativa habilidades de mana e paga com a reserva,
// ou pede o pagamento automático (o que os bots sempre fazem).

import { addMana, addCounters, blight as doBlight, discard, loseLife, mill, moveObjects, removeCounters, sacrifice, tap, untap } from './actions.ts';
import { blightCandidates } from './actions.ts';
import { ask, chooseColor, chooseItems, chooseNumber, objItem } from './ask.ts';
import { abilityDefs, chars, controllerOf, hasKw, hooks, isCreature, isType, nameOf, power } from './chars.ts';
import { registry, type CostPart, type Ctx, type Gen, type ManaAbilityDef, type SCtx } from './defs.ts';
import type { G } from './game-context.ts';
import { formatCost, genericOf, matchPool, parseCost, phyrexianCount, poolToString, reduceGeneric, type SpendContext } from './mana.ts';
import { addPending, emit } from './triggers.ts';
import { oracle } from './oracle.ts';
import type { Answer, ManaSymbol, ManaType, ManaUnit, ObjId, PaymentSource, PlayerId } from './types.ts';

// ---------------------------------------------------------------------------
// Fontes de mana
// ---------------------------------------------------------------------------
export interface ManaOption {
  key: string;
  obj: ObjId;
  abilityId: string;
  alt: ManaType[];
  altIndex: number;
  def: ManaAbilityDef;
  /** custo de mana da própria habilidade (terrenos-filtro, Signets) */
  manaCost: ManaSymbol[];
  /** preferência: menor = usar antes */
  rank: number;
  /** mana adicional prevista; é realmente produzida pelas habilidades engatilhadas, sem pilha */
  bonus: ManaUnit[];
}

export function basicManaDef(color: ManaType): ManaAbilityDef {
  return registry.abilities.get(`basic:${color}`) as ManaAbilityDef;
}

/**
 * CR 302.6: criatura só ataca ou usa {T}/{Q} se está sob controle do jogador desde o
 * início do turno mais recente dele. Ímpeto ignora a regra (702.10b-c).
 */
export function summoningSick(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  if (!o || !isCreature(g, id)) return false;
  if (hasKw(g, id, 'haste')) return false;
  const ctrl = controllerOf(g, id);
  return o.controlledSince >= g.state.players[ctrl].lastTurn;
}

/** consegue pagar as partes não-mana deste custo agora? */
export function canPayParts(g: G, player: PlayerId, parts: CostPart[], source: ObjId, x = 0): boolean {
  const s = g.state;
  const o = s.objects[source];
  const ctx: SCtx = { g, you: player, source };
  for (const p of parts) {
    switch (p.k) {
      case 'mana': break;
      case 'tap': if (!o || o.zone !== 'battlefield' || o.tapped || summoningSick(g, source)) return false; break;
      case 'untap': if (!o || o.zone !== 'battlefield' || !o.tapped || summoningSick(g, source)) return false; break;
      case 'sacrificeSelf': if (!o || o.zone !== 'battlefield') return false; break;
      case 'sacrifice': {
        const n = p.n === 'X' ? x : p.n;
        if (s.zones.battlefield.filter((id) => controllerOf(g, id) === player && !s.objects[id].phasedOut && p.filter(ctx, id)).length < n) return false;
        break;
      }
      case 'discard': if (s.zones.hand[player].filter((id) => id !== source && (!p.filter || p.filter(ctx, id))).length < p.n) return false; break;
      case 'discardSelf': if (!o || o.zone !== 'hand') return false; break;
      case 'life': {
        const n = typeof p.n === 'function' ? p.n(ctx) : p.n === 'X' ? x : p.n;
        if (s.players[player].life < n) return false; // CR 119.4
        break;
      }
      case 'exileSelf': if (!o) return false; break;
      case 'exileFromGraveyard': if (s.zones.graveyard[player].filter((id) => (!p.other || id !== source) && (!p.filter || p.filter(ctx, id))).length < p.n) return false; break;
      case 'removeCounter': if (!o || (o.counters[p.kind] ?? 0) < p.n) return false; break;
      case 'removeCountersAmong': {
        const total = s.zones.battlefield.filter((id) => controllerOf(g, id) === player && isCreature(g, id)).reduce((t, id) => t + Object.values(s.objects[id].counters).reduce((a, b) => a + b, 0), 0);
        if (total < p.n) return false;
        break;
      }
      case 'addCounterSelf': if (!o || o.zone !== 'battlefield') return false; break;
      case 'blight': {
        if (blightCandidates(g, player).length === 0) return false; // CR 701.68b
        break;
      }
      case 'mill': if (s.zones.library[player].length < p.n) return false; break; // CR 701.17b
      case 'tapCreatures': if (s.zones.battlefield.filter((id) => (p.includeSelf || id !== source) && controllerOf(g, id) === player && isCreature(g, id) && !s.objects[id].tapped && (!p.filter || p.filter(ctx, id))).length < p.n) return false; break;
      case 'tapPermanents': if (costPermanents(g, player, (id) => !s.objects[id].tapped && p.filter(ctx, id)).length < p.n) return false; break;
      case 'crew': if (crewCandidates(g, player, source).reduce((n, id) => n + Math.max(0, power(g, id)), 0) < p.power) return false; break;
      case 'returnPermanent': if (!costPermanents(g, player, (id) => p.filter(ctx, id)).length) return false; break;
      case 'loyalty': {
        const n = p.n === 'X' ? -x : p.n;
        if (n < 0 && (!o || (o.counters.loyalty ?? 0) < -n)) return false; // CR 606.6
        break;
      }
      case 'returnLand': break;
      case 'returnUnblockedAttacker': if (!unblockedAttackers(g, player).length) return false; break;
      case 'revealSelf': if (!o || (o.zone !== 'hand' && o.zone !== 'command')) return false; break;
    }
  }
  return recursosDistintos(g, player, parts, source, x);
}

/** partes que viram permanentes: pagas antes das outras (CR 601.2h: em qualquer ordem), para que virar e depois
 *  sacrificar o mesmo permanente continue possível */
const PARTES_DE_VIRAR = new Set<CostPart['k']>(['tap', 'tapCreatures', 'tapPermanents', 'crew']);

/**
 * CR 118.3, 118.10: cada parte de um custo composto precisa dos seus próprios recursos. Um permanente já virado não
 * pode ser virado de novo (virar N permanentes, tripular, {T}), e um que saiu do campo não paga outra parte que o tira
 * do campo (sacrificar, devolver à mão, exilar). Virar e sacrificar o mesmo permanente vale, como na mesa real.
 * Cada parte isolada já foi conferida em canPayParts; aqui só os custos com mais de uma parte do mesmo tipo.
 */
function recursosDistintos(g: G, player: PlayerId, parts: CostPart[], source: ObjId, x: number): boolean {
  let viradas = 0, saidas = 0, vidas = 0, tripular = 0;
  for (const p of parts) {
    if (p.k === 'tap') viradas++;
    else if (p.k === 'tapCreatures' || p.k === 'tapPermanents') viradas += p.n;
    else if (p.k === 'crew') tripular += p.power;
    else if (p.k === 'sacrificeSelf' || p.k === 'exileSelf' || p.k === 'returnPermanent') saidas++;
    else if (p.k === 'sacrifice') saidas += p.n === 'X' ? x : p.n;
    else if (p.k === 'life') vidas++;
  }
  if (viradas + (tripular > 0 ? 1 : 0) < 2 && saidas < 2 && vidas < 2) return true;
  const s = g.state;
  const ctx: SCtx = { g, you: player, source };
  const noCampo = s.objects[source]?.zone === 'battlefield';
  const vagasVirar: ObjId[][] = [];
  const vagasSair: ObjId[][] = [];
  let vida = 0;
  const repetir = (lista: ObjId[][], cands: ObjId[], n: number) => { for (let i = 0; i < n; i++) lista.push(cands); };
  for (const p of parts) {
    switch (p.k) {
      case 'tap': vagasVirar.push([source]); break;
      case 'tapCreatures': repetir(vagasVirar, s.zones.battlefield.filter((id) => (p.includeSelf || id !== source) && controllerOf(g, id) === player && !s.objects[id].phasedOut && isCreature(g, id) && !s.objects[id].tapped && (!p.filter || p.filter(ctx, id))), p.n); break;
      case 'tapPermanents': repetir(vagasVirar, costPermanents(g, player, (id) => !s.objects[id].tapped && p.filter(ctx, id)), p.n); break;
      case 'sacrificeSelf': vagasSair.push([source]); break;
      case 'exileSelf': if (noCampo) vagasSair.push([source]); break;
      case 'sacrifice': repetir(vagasSair, costPermanents(g, player, (id) => p.filter(ctx, id)), p.n === 'X' ? x : p.n); break;
      case 'returnPermanent': vagasSair.push(costPermanents(g, player, (id) => p.filter(ctx, id))); break;
      case 'life': {
        vida += Math.max(0, typeof p.n === 'function' ? p.n(ctx) : p.n === 'X' ? x : p.n);
        if (s.players[player].life < vida) return false; // CR 119.4
        break;
      }
      default: break;
    }
  }
  if (!emparelhar(vagasSair, () => 0)) return false;
  // as vagas de virar ficam com os permanentes que menos fazem falta na tripulação (os que não são criaturas e os fracos)
  const peso = (id: ObjId) => (isCreature(g, id) ? Math.max(0, power(g, id)) + 1 : 0);
  const viradosNoPlano = emparelhar(vagasVirar, peso);
  if (!viradosNoPlano) return false;
  if (tripular > 0) {
    const forca = crewCandidates(g, player, source).filter((id) => !viradosNoPlano.has(id)).reduce((n, id) => n + Math.max(0, power(g, id)), 0);
    if (forca < tripular) return false;
  }
  return true;
}

/**
 * Atacantes não bloqueados que o jogador controla (CR 509.1h): só existem depois que os bloqueadores foram declarados,
 * da etapa de declarar bloqueadores até o fim do combate. Quem entrou atacando depois disso está não bloqueado (506.3d).
 */
export function unblockedAttackers(g: G, player: PlayerId): ObjId[] {
  const s = g.state;
  const cb = s.combat;
  if (!cb) return [];
  const t = s.turn;
  const depoisDosBloqueios = t.step === 'declareBlockers' ? t.stepBegun : t.step === 'firstStrikeDamage' || t.step === 'combatDamage' || t.step === 'endCombat';
  if (!depoisDosBloqueios) return [];
  return cb.attackers.filter((a) => !a.removed && !a.blocked && s.objects[a.id]?.zone === 'battlefield' && !s.objects[a.id].phasedOut && controllerOf(g, a.id) === player).map((a) => a.id);
}

/** emparelhamento de vagas com permanentes distintos por caminhos aumentantes; devolve os permanentes usados ou null */
function emparelhar(vagas: ObjId[][], peso: (id: ObjId) => number): Set<ObjId> | null {
  if (!vagas.length) return new Set();
  const ordem = vagas.map((v) => [...v].sort((a, b) => peso(a) - peso(b))).sort((a, b) => a.length - b.length);
  const dono = new Map<ObjId, number>();
  const reservar = (i: number, vistos: Set<ObjId>): boolean => {
    for (const id of ordem[i]) if (!dono.has(id)) { dono.set(id, i); return true; }
    for (const id of ordem[i]) {
      if (vistos.has(id)) continue;
      vistos.add(id);
      if (reservar(dono.get(id)!, vistos)) { dono.set(id, i); return true; }
    }
    return false;
  };
  for (let i = 0; i < ordem.length; i++) if (!reservar(i, new Set())) return null;
  return new Set(dono.keys());
}

/** opções de mana disponíveis para um jogador agora */
export function manaOptions(g: G, player: PlayerId, opts: { excludeSource?: ObjId } = {}): ManaOption[] {
  const out: ManaOption[] = [];
  const bonusHooks = hooks(g, 'extraManaForPlanning');
  for (const id of g.state.zones.battlefield) {
    if (id === opts.excludeSource) continue;
    const o = g.state.objects[id];
    if (o.phasedOut || controllerOf(g, id) !== player) continue;
    for (const { inst, def } of abilityDefs(g, id)) {
      if (def.kind !== 'mana') continue;
      const ctx: SCtx = { g, you: player, source: id };
      if (def.condition && !def.condition(ctx)) continue;
      if (def.oncePerTurn && o.usedThisTurn[inst.id] === g.state.turn.number) continue;
      if (!canPayParts(g, player, def.cost, id)) continue;
      const manaPart = def.cost.find((p) => p.k === 'mana') as { k: 'mana'; cost: string } | undefined;
      const manaCost = manaPart ? parseCost(manaPart.cost) : [];
      let alts: ManaType[][];
      try { alts = def.produce(ctx); } catch { alts = []; }
      alts = alts.filter((a) => a.length > 0);
      alts.forEach((alt, i) => {
        let rank = 0;
        if (isCreature(g, id)) rank += 2;
        if (def.cost.some((p) => p.k === 'sacrificeSelf')) rank += 6;
        if (def.cost.some((p) => p.k === 'life' || p.k === 'mill' || p.k === 'removeCounter' || p.k === 'addCounterSelf')) rank += 4;
        if (def.extra) rank += 3;
        if (manaCost.length) rank += 1;
        if (!chars(g, id).types.includes('Land')) rank += 1;
        const bonus = bonusHooks.flatMap((h) => h.fn(h.ctx, player, id, alt, def.cost.some((p) => p.k === 'tap')).map((type) => ({ type, source: h.ctx.source })));
        out.push({ key: `${id}|${inst.id}|${i}`, obj: id, abilityId: inst.id, alt, altIndex: i, def, manaCost, rank, bonus });
      });
    }
  }
  return out;
}

/** ativa uma habilidade de mana (CR 605.3: resolve na hora). `hint` decide as cores de '*' */
export function* activateManaAbility(g: G, player: PlayerId, opt: ManaOption, hint: ManaType[] = []): Gen<boolean> {
  const o = g.state.objects[opt.obj];
  if (!o) return false;
  const ctx: Ctx = { g, you: player, self: opt.obj, source: opt.obj, targets: [], x: 0, modes: [], paid: {}, event: {}, data: {} };
  if (opt.manaCost.length) {
    const ok = yield* payManaFromPoolOnly(g, player, opt.manaCost);
    if (!ok) return false;
  }
  const paid = yield* payParts(g, player, opt.def.cost.filter((p) => p.k !== 'mana'), opt.obj, 0, true);
  if (!paid) return false;
  if (opt.def.oncePerTurn) { const s = g.state.objects[opt.obj]; if (s) s.usedThisTurn[opt.abilityId] = g.state.turn.number; }
  // "qualquer combinação de cores": cada '*' vira uma cor escolhida agora (CR 106.1a)
  const alt: ManaType[] = [];
  let hi = 0;
  for (const t of opt.alt) {
    if ((t as string) !== '*') { alt.push(t); continue; }
    const h = hint[hi++];
    if (h && h !== 'C') alt.push(h);
    else alt.push(yield* chooseColor(g, player, `${nameOf(g, opt.obj)}: escolha a cor da mana`));
  }
  // virou para pagar o {T}: a permanente guarda qual virar foi e quanta mana ele deu, e cada mana leva o número desse
  // virar. O desvirar à mão confere se ela ainda está toda na reserva (manual.ts manaDesfazivel)
  const fonte = g.state.objects[opt.obj];
  let virar: number | undefined;
  if (fonte?.tapped && opt.def.cost.some((p) => p.k === 'tap')) {
    virar = (fonte.manaTaps ?? 0) + 1;
    fonte.manaTaps = virar;
    fonte.manaTap = { seq: virar, n: alt.length };
  }
  addMana(g, player, alt, {
    source: opt.obj,
    restriction: opt.def.restriction,
    untilEndOfTurn: opt.def.untilEndOfTurn,
    onSpend: opt.def.onSpend ? { abilityId: opt.def.onSpend, source: opt.obj, controller: player } : undefined,
    ...(opt.def.rider ? { rider: opt.def.rider } : {}),
    ...(virar !== undefined ? { tap: virar } : {}),
  });
  emit(g, [{ type: 'mana', player, source: opt.obj, produced: alt, tappedForMana: opt.def.cost.some((p) => p.k === 'tap') }]);
  const antesDosGatilhos = new Set(g.state.players.flatMap((q) => q.manaPool));
  yield* resolveTriggeredMana(g);
  // A mana adicional conserva a fonte da habilidade que a produziu, mas desfazer o virar original
  // precisa retirar o lote inteiro, inclusive esse bônus, e só pode fazê-lo enquanto nada foi gasto.
  if (virar !== undefined && fonte?.manaTap?.seq === virar) {
    const adicionais = g.state.players.flatMap((q) => q.manaPool).filter((u) => !antesDosGatilhos.has(u));
    for (const u of adicionais) { u.tap = virar; u.tapSource = opt.obj; }
    fonte.manaTap.n += adicionais.length;
    if (adicionais.length) g.bump();
  }
  if (opt.def.extra) yield* opt.def.extra(ctx);
  return true;
}

function* payManaFromPoolOnly(g: G, player: PlayerId, cost: ManaSymbol[]): Gen<boolean> {
  const pool = g.state.players[player].manaPool;
  const m = matchPool(cost, pool);
  if (!m) return false;
  g.state.players[player].manaPool = pool.filter((_, i) => !m.includes(i));
  g.bump();
  return true;
}

// ---------------------------------------------------------------------------
// Planejamento automático
// ---------------------------------------------------------------------------
export interface PayContext extends SpendContext {
  purpose: { kind: 'spell'; obj: ObjId } | { kind: 'ability'; obj: ObjId } | { kind: 'effect' };
  excludeSource?: ObjId;
  improvise?: boolean;
}

function costPermanents(g: G, player: PlayerId, filter: (id: ObjId) => boolean): ObjId[] {
  return g.state.zones.battlefield.filter((id) => !g.state.objects[id].phasedOut && controllerOf(g, id) === player && filter(id));
}

export function crewCandidates(g: G, player: PlayerId, source: ObjId): ObjId[] {
  // CR 702.122a: outras criaturas; não se pode tripular o próprio veículo.
  return costPermanents(g, player, (id) => id !== source && isCreature(g, id) && !g.state.objects[id].tapped && !hasKw(g, id, 'cantCrew'));
}

export function improviseCandidates(g: G, player: PlayerId): ObjId[] {
  return costPermanents(g, player, (id) => isType(g, id, 'Artifact') && !g.state.objects[id].tapped);
}

/** ordem em que o pagamento automático vira artefatos para improvisar: primeiro os que não são criaturas (virar uma
 *  criatura tira o ataque e o bloqueio), depois os que não têm habilidade de mana nem outra habilidade com {T}; entre as
 *  criaturas, as com enjoo de invocação (não atacariam mesmo) antes das que podem atacar */
export function improviseOrder(g: G, ids: ObjId[]): ObjId[] {
  const peso = (id: ObjId): number => {
    let n = 0;
    if (isCreature(g, id)) { n += 10; if (!summoningSick(g, id)) n += 1; }
    const defs = abilityDefs(g, id);
    if (defs.some(({ def }) => def.kind === 'mana')) n += 2;
    if (defs.some(({ def }) => def.kind === 'activated' && def.cost.some((p) => p.k === 'tap'))) n += 1;
    return n;
  };
  return [...ids].sort((a, b) => peso(a) - peso(b) || a - b);
}

function producedUnits(o: ManaOption): ManaUnit[] {
  return [...o.alt.map((type) => ({ type, source: o.obj, restriction: o.def.restriction })), ...o.bonus];
}

/** CR 605.4: habilidades de mana engatilhadas resolvem imediatamente, inclusive durante pagamento. */
function* resolveTriggeredMana(g: G): Gen<void> {
  for (let guard = 0; guard < 100; guard++) {
    const index = g.state.pendingTriggers.findIndex((t) => {
      const d = registry.abilities.get(t.abilityId);
      return d?.kind === 'triggered' && d.mana;
    });
    if (index < 0) return;
    const [t] = g.state.pendingTriggers.splice(index, 1);
    const d = registry.abilities.get(t.abilityId);
    if (d?.kind !== 'triggered' || g.state.players[t.controller].left) continue;
    yield* d.effect({ g, you: t.controller, self: t.source, source: t.source, targets: [], x: 0, modes: [], paid: {}, event: t.event, data: t.data });
  }
  throw new Error('Laço de habilidades de mana engatilhadas sem fim');
}

function canSpendFn(g: G, ctx: PayContext): (u: ManaUnit) => boolean {
  return (u) => {
    if (!u.restriction) return true;
    const fn = registry.fns.get(u.restriction) as ((g: G, purpose: PayContext['purpose']) => boolean) | undefined;
    return fn ? fn(g, ctx.purpose) : true;
  };
}

/**
 * Procura um conjunto de habilidades de mana que, ativadas, deixam a reserva capaz de pagar
 * o custo. Busca em profundidade com preferência por terrenos sem efeito colateral.
 * `enxuto`: tira do plano as fontes que não fazem falta (quem vai pagar de verdade usa isso; para
 * saber se dá para pagar, basta achar um plano qualquer).
 */
export function planPayment(g: G, player: PlayerId, cost: ManaSymbol[], ctx: PayContext, life = 0, enxuto = false): ManaOption[] | null {
  const spend: SpendContext = { canSpend: canSpendFn(g, ctx), anyType: ctx.anyType, lifeForPhyrexian: life };
  const pool0 = g.state.players[player].manaPool.slice();
  if (matchPool(cost, pool0, spend)) return [];
  const opts = manaOptions(g, player, { excludeSource: ctx.excludeSource }).sort((a, b) => a.rank - b.rank || a.obj - b.obj);
  // agrupa por fonte (cada fonte só pode ser ativada uma vez quando tem {T})
  const bySource = new Map<string, ManaOption[]>();
  for (const o of opts) {
    const k = `${o.obj}|${o.abilityId}`;
    if (!bySource.has(k)) bySource.set(k, []);
    bySource.get(k)!.push(o);
  }
  const groups = [...bySource.values()];
  const needColors = new Set<ManaType>();
  for (const s of cost) {
    if (s.k === 'color') needColors.add(s.c);
    if (s.k === 'hybrid') { needColors.add(s.a); needColors.add(s.b); }
    if (s.k === 'monohybrid' || s.k === 'phyrexian') needColors.add(s.c);
    if (s.k === 'C') needColors.add('C');
  }
  const usedObjs = new Set<ObjId>();
  const improvisers = ctx.improvise ? improviseCandidates(g, player) : [];
  // quantos artefatos o plano pode improvisar: null = todos os que sobrarem livres (basta para saber se dá para pagar)
  let limite: number | null = null;
  const paga = (pool: ManaUnit[], livres: number): boolean => {
    if (!ctx.improvise) return !!matchPool(cost, pool, spend);
    const n = limite === null ? livres : limite;
    return n <= livres && !!matchPool(reduceGeneric(cost, n), pool, spend);
  };
  let nodes = 0;
  let plan: ManaOption[] = [];
  function score(alt: ManaType[]): number { return -alt.filter((t) => needColors.has(t)).length; }
  function dfs(gi: number, pool: ManaUnit[]): boolean {
    if (++nodes > 4000) return false;
    if (paga(pool, improvisers.filter((id) => !usedObjs.has(id)).length)) return true;
    if (gi >= groups.length) return false;
    const group = groups[gi];
    const objId = group[0].obj;
    const tapsSelf = group[0].def.cost.some((p) => p.k === 'tap' || p.k === 'sacrificeSelf');
    if (!(tapsSelf && usedObjs.has(objId))) {
      const alts = [...group].sort((a, b) => score(a.alt) - score(b.alt));
      for (const o of alts) {
        let p2 = pool;
        if (o.manaCost.length) {
          const m = matchPool(o.manaCost, pool);
          if (!m) continue;
          p2 = pool.filter((_, i) => !m.includes(i));
        }
        p2 = [...p2, ...producedUnits(o)];
        plan.push(o);
        if (tapsSelf) usedObjs.add(objId);
        if (dfs(gi + 1, p2)) return true;
        plan.pop();
        if (tapsSelf) usedObjs.delete(objId);
      }
    }
    return dfs(gi + 1, pool);
  }
  if (!dfs(0, pool0)) return null;
  if (!enxuto) return plan;
  const reservaCom = (lista: ManaOption[]): ManaUnit[] | null => {
    let pool = pool0;
    for (const o of lista) {
      if (o.manaCost.length) {
        const m = matchPool(o.manaCost, pool);
        if (!m) return null;
        pool = pool.filter((_, i) => !m.includes(i));
      }
      pool = [...pool, ...producedUnits(o)];
    }
    return pool;
  };
  const livresSem = (lista: ManaOption[]): number => {
    const used = new Set(lista.filter((o) => o.def.cost.some((p) => p.k === 'tap' || p.k === 'sacrificeSelf')).map((o) => o.obj));
    return improvisers.filter((id) => !used.has(id)).length;
  };
  if (ctx.improvise) {
    // CR 702.126a: improvisar é opcional para cada mana genérica. A busca acima conta todos os artefatos livres e por
    // isso improvisava antes de somar os terrenos (Kappa Cannoneer com seis Islands virava cinco Thopters). Quem paga
    // de verdade usa primeiro as fontes de mana e só improvisa o que faltar: procura o plano com o menor número de
    // artefatos virados (eles podem ser criaturas que atacariam ou bloqueariam).
    const reserva = reservaCom(plan)!;
    let precisa = 0;
    while (precisa < improvisers.length && !matchPool(reduceGeneric(cost, precisa), reserva, spend)) precisa++;
    let achado = { plan: [...plan], n: precisa };
    for (let n = 0; n < precisa; n++) {
      limite = n; nodes = 0; plan = []; usedObjs.clear();
      if (dfs(0, pool0)) { achado = { plan: [...plan], n }; break; }
    }
    plan = achado.plan;
    limite = achado.n;
  }
  // a busca vai acrescentando fontes na ordem de preferência até a conta fechar, e com isso virava
  // terrenos que no fim não pagavam nada (ex.: {W} com Forest, Swamp e Plains virava os três, e {G}{B}
  // sobrava na reserva). Tira uma de cada vez, das menos preferidas para as mais, enquanto o resto pagar.
  const final = [...plan];
  for (let i = final.length - 1; i >= 0; i--) {
    const sem = [...final.slice(0, i), ...final.slice(i + 1)];
    const pool = reservaCom(sem);
    if (pool && paga(pool, livresSem(sem))) final.splice(i, 1);
  }
  return final;
}

export function canAfford(g: G, player: PlayerId, cost: ManaSymbol[], ctx: PayContext): boolean {
  const life = Math.min(phyrexianCount(cost), Math.floor(Math.max(0, g.state.players[player].life - 1) / 2));
  return planPayment(g, player, cost, ctx, 0) !== null || (life > 0 && planPayment(g, player, cost, ctx, life) !== null);
}

// ---------------------------------------------------------------------------
// Pagamento de mana (decisão)
// ---------------------------------------------------------------------------
export interface PaidMana { units: ManaUnit[]; lifePaid: number }

/**
 * Pede o pagamento de um custo de mana. Devolve null se o jogador cancelar
 * (quem chama desfaz a conjuração, CR 733) ou o que foi gasto.
 */
export function* payMana(g: G, player: PlayerId, cost: ManaSymbol[], ctx: PayContext & { canCancel: boolean; label: string }): Gen<PaidMana | null> {
  const p = g.state.players[player];
  const phy = phyrexianCount(cost);
  let lifeChoice = 0;
  if (cost.length === 0) return { units: [], lifePaid: 0 };
  for (;;) {
    const spend: SpendContext = { canSpend: canSpendFn(g, ctx), anyType: ctx.anyType, lifeForPhyrexian: lifeChoice };
    const opts = manaOptions(g, player, { excludeSource: ctx.excludeSource });
    const auto = planPayment(g, player, cost, ctx, lifeChoice, true);
    const sources: PaymentSource[] = opts.map((o) => ({ id: o.key, obj: o.obj, label: `${nameOf(g, o.obj)}: ${o.alt.map((t) => `{${t}}`).join('')}`, produces: o.alt }));
    const improvisers = ctx.improvise && genericOf(cost) > 0 ? improviseCandidates(g, player) : [];
    sources.push(...improvisers.map((id) => ({ id: `improvise:${id}`, obj: id, label: `Improvisar: vire ${nameOf(g, id)} para pagar {1}`, produces: [] })));
    // Improvisar (CR 702.126a) em ordem livre, como na mesa real: virar um artefato paga {1} do genérico e a janela de
    // mana continua aberta para as outras fontes pagarem o resto. O resultado é o mesmo de ativar todas as habilidades
    // de mana antes (CR 601.2g) e virar os artefatos ao pagar (CR 601.2h): o artefato virado para improvisar já não
    // pode ser usado numa habilidade de mana, e cancelar desfaz a conjuração inteira (CR 733).
    const a = yield* ask<Extract<Answer, { kind: 'payment' }>>(g, {
      kind: 'payment', player, prompt: `Pague ${formatCost(cost)} para ${ctx.label}`,
      cost: formatCost(cost), remaining: `${formatCost(cost)} (reserva: ${poolToString(p.manaPool) || 'vazia'})`,
      sources, canAuto: auto !== null, lifeOptions: phy, canCancel: ctx.canCancel,
    }, (ans) => {
      if (ans.kind !== 'payment') return 'Resposta inválida';
      if (ans.cancel && !ctx.canCancel) return 'Este pagamento não pode ser cancelado';
      if (ans.auto && auto === null) return 'Não há mana suficiente';
      if (ans.activate && !sources.some((o) => o.id === ans.activate!.source)) return 'Fonte indisponível';
      if (ans.life !== undefined && (ans.life < 0 || ans.life > phy || p.life < 2 * ans.life)) return 'Vida insuficiente';
      if (ans.pay && !matchPool(cost, p.manaPool, { ...spend, lifeForPhyrexian: ans.life ?? lifeChoice })) return 'A reserva não paga o custo inteiro';
      return null;
    });
    if (a.cancel) return null;
    if (a.life !== undefined) lifeChoice = a.life;
    if (a.auto) {
      const hint = colorHint(g, player, cost);
      for (const o of auto!) {
        const fresh = manaOptions(g, player, { excludeSource: ctx.excludeSource }).find((x) => x.key === o.key);
        if (fresh) yield* activateManaAbility(g, player, fresh, hint);
      }
      if (ctx.improvise) {
        // Use apenas os artefatos ainda desvirados depois de todas as habilidades de mana, na ordem de preferência
        // (os que não são criaturas primeiro), e só quantos faltarem para a reserva pagar o resto.
        const remaining = improviseOrder(g, improviseCandidates(g, player));
        let n = 0;
        while (n <= Math.min(genericOf(cost), remaining.length) && !matchPool(reduceGeneric(cost, n), p.manaPool, spend)) n++;
        if (n > Math.min(genericOf(cost), remaining.length)) continue;
        for (const id of remaining.slice(0, n)) tap(g, id);
        cost = reduceGeneric(cost, n);
      }
    } else if (a.activate) {
      if (a.activate.source.startsWith('improvise:')) {
        tap(g, Number(a.activate.source.slice('improvise:'.length)));
        cost = reduceGeneric(cost, 1);
        continue;
      }
      const o = opts.find((x) => x.key === a.activate!.source)!;
      yield* activateManaAbility(g, player, o);
      continue;
    }
    if (a.auto || a.pay) {
      const finalSpend: SpendContext = { canSpend: canSpendFn(g, ctx), anyType: ctx.anyType, lifeForPhyrexian: lifeChoice };
      const m = matchPool(cost, p.manaPool, finalSpend);
      if (!m) continue;
      const units = m.map((i) => p.manaPool[i]);
      p.manaPool = p.manaPool.filter((_, i) => !m.includes(i));
      if (lifeChoice > 0) loseLife(g, player, 2 * lifeChoice, null); // CR 107.4f
      g.bump();
      // gatilhos de mana gasta (CR 106.6)
      for (const u of units) if (u.onSpend && ctx.purpose.kind === 'spell') addPending(g, u.onSpend.abilityId, u.onSpend.source, u.onSpend.controller, { spell: ctx.purpose.obj }, {});
      // efeitos presos à mana que valem na hora em que ela é gasta, sem pilha (Carnelian Orb of Dragonkind)
      for (const u of units) if (u.rider) (registry.fns.get(u.rider) as ((g: G, u: ManaUnit, purpose: PayContext['purpose'], player: PlayerId) => void) | undefined)?.(g, u, ctx.purpose, player);
      return { units, lifePaid: lifeChoice };
    }
  }
}

/** cores que faltam na reserva para pagar o custo (para escolher cores de mana coringa) */
function colorHint(g: G, player: PlayerId, cost: ManaSymbol[]): ManaType[] {
  const have = g.state.players[player].manaPool.map((u) => u.type);
  const need: ManaType[] = [];
  for (const s of cost) {
    const c = s.k === 'color' || s.k === 'phyrexian' || s.k === 'monohybrid' ? s.c : s.k === 'hybrid' ? s.a : null;
    if (!c) continue;
    const i = have.indexOf(c);
    if (i >= 0) have.splice(i, 1); else need.push(c);
  }
  const ident = g.state.players[player].commanders.flatMap((cid) => oracle(g.state.cards[cid].def).colorIdentity);
  const filler = (ident[0] ?? 'W') as ManaType;
  return [...need, ...Array(20).fill(filler)];
}

// ---------------------------------------------------------------------------
// Partes não-mana
// ---------------------------------------------------------------------------
/** paga partes de custo que não são mana. Devolve false se não conseguiu (sem efeito parcial garantido) */
export function* payParts(g: G, player: PlayerId, parts: CostPart[], source: ObjId, x: number, isMana = false): Gen<Record<string, unknown> | false> {
  const s = g.state;
  const ctx: SCtx = { g, you: player, source };
  const info: Record<string, unknown> = {};
  if (!canPayParts(g, player, parts, source, x)) return false;
  parts = [...parts.filter((p) => PARTES_DE_VIRAR.has(p.k)), ...parts.filter((p) => !PARTES_DE_VIRAR.has(p.k))];
  for (const p of parts) {
    // A mana ou uma parte anterior pode ter consumido recursos; aborta para o chamador restaurar a
    // conjuração/ativação, sem perguntar uma seleção obrigatória numa lista vazia.
    if (!canPayParts(g, player, [p], source, x)) return false;
    switch (p.k) {
      case 'mana': break;
      case 'tap': tap(g, source, isMana); break;
      case 'untap': untap(g, source); break;
      case 'sacrificeSelf': {
        const o = s.objects[source];
        info.sacrificed = [o?.id];
        info.sacrificedLki = source;
        yield* sacrifice(g, [source]);
        break;
      }
      case 'sacrifice': {
        const n = p.n === 'X' ? x : p.n;
        if (n === 0) break;
        const cands = s.zones.battlefield.filter((id) => controllerOf(g, id) === player && !s.objects[id].phasedOut && p.filter(ctx, id));
        const ids = yield* chooseItems(g, player, `Sacrifique ${n === 1 ? p.label : `${n} × ${p.label}`}`, cands.map((id) => objItem(g, id, nameOf(g, id))), n, n);
        const sac = ids.map(Number);
        info.sacrificed = [...((info.sacrificed as ObjId[]) ?? []), ...sac];
        yield* sacrifice(g, sac);
        break;
      }
      case 'discard': {
        const res = yield* discard(g, player, p.n, { filter: (id) => id !== source && (!p.filter || p.filter(ctx, id)), random: p.random });
        info.discarded = res;
        break;
      }
      case 'discardSelf': {
        const res = yield* moveObjects(g, [{ id: source, to: 'graveyard' }], 'discard');
        info.discarded = res;
        break;
      }
      case 'life': {
        const n = typeof p.n === 'function' ? p.n(ctx) : p.n === 'X' ? x : p.n;
        if (n > 0) loseLife(g, player, n, source); // CR 119.4
        info.lifePaid = n;
        break;
      }
      case 'exileSelf': {
        const res = yield* moveObjects(g, [{ id: source, to: 'exile' }], 'exile');
        info.exiledSelf = res[0];
        break;
      }
      case 'exileFromGraveyard': {
        const cands = s.zones.graveyard[player].filter((id) => (!p.other || id !== source) && (!p.filter || p.filter(ctx, id)));
        const ids = yield* chooseItems(g, player, `Exile ${p.n} carta(s) do seu cemitério`, cands.map((id) => objItem(g, id, nameOf(g, id))), p.n, p.n);
        info.exiledFromGraveyard = yield* moveObjects(g, ids.map((id) => ({ id: Number(id), to: 'exile' as const })), 'exile');
        break;
      }
      case 'removeCounter': removeCounters(g, { kind: 'obj', id: source }, p.kind, p.n); break;
      case 'removeCountersAmong': {
        let left = p.n;
        while (left > 0) {
          const cands = s.zones.battlefield.filter((id) => controllerOf(g, id) === player && isCreature(g, id) && Object.values(s.objects[id].counters).some((v) => v > 0));
          const items = cands.flatMap((id) => Object.entries(s.objects[id].counters).filter(([, v]) => v > 0).map(([k]) => ({ id: `${id}|${k}`, label: `${nameOf(g, id)}: marcador ${k}`, obj: id })));
          const [pick] = yield* chooseItems(g, player, `Remova um marcador (faltam ${left})`, items, 1, 1);
          const [oid, kind] = pick.split('|');
          removeCounters(g, { kind: 'obj', id: Number(oid) }, kind, 1);
          left--;
        }
        break;
      }
      case 'addCounterSelf': addCounters(g, { kind: 'obj', id: source }, p.kind, p.n, player); break;
      case 'blight': {
        const n = p.n === 'X' ? x : p.n;
        info.blighted = yield* doBlight(g, player, n);
        break;
      }
      case 'mill': info.milled = yield* mill(g, player, p.n); break;
      case 'tapCreatures': {
        const cands = s.zones.battlefield.filter((id) => (p.includeSelf || id !== source) && controllerOf(g, id) === player && isCreature(g, id) && !s.objects[id].tapped && (!p.filter || p.filter(ctx, id)));
        const ids = yield* chooseItems(g, player, `Vire ${p.n} ${p.label ?? 'criatura(s) desvirada(s)'} que você controla`, cands.map((id) => objItem(g, id, nameOf(g, id))), p.n, p.n);
        for (const id of ids) tap(g, Number(id));
        break;
      }
      case 'tapPermanents': {
        const cands = costPermanents(g, player, (id) => !s.objects[id].tapped && p.filter(ctx, id));
        if (cands.length < p.n) return false;
        const ids = yield* chooseItems(g, player, `Vire ${p.n} ${p.label} que você controla`, cands.map((id) => objItem(g, id, nameOf(g, id))), p.n, p.n);
        for (const id of ids.map(Number)) tap(g, id);
        info.tapped = [...((info.tapped as ObjId[]) ?? []), ...ids.map(Number)];
        break;
      }
      case 'crew': {
        const cands = crewCandidates(g, player, source);
        const picked: ObjId[] = [];
        let total = 0;
        for (;;) {
          const remaining = cands.filter((id) => !picked.includes(id));
          const positive = remaining.reduce((n, id) => n + Math.max(0, power(g, id)), 0);
          if (total + positive < p.power) return false;
          const [choice] = yield* chooseItems(g, player, `Tripular: força total ${total}; precisa de ${p.power}. Escolha outra criatura ou conclua`, [
            { id: 'done', label: 'Concluir tripulação', disabled: total < p.power },
            ...remaining.map((id) => ({ ...objItem(g, id, nameOf(g, id)), disabled: total + power(g, id) + positive - Math.max(0, power(g, id)) < p.power })),
          ], 1, 1);
          if (choice === 'done') break;
          const id = Number(choice); picked.push(id); total += power(g, id);
        }
        for (const id of picked) tap(g, id);
        info.crewedBy = picked;
        break;
      }
      case 'returnPermanent': {
        const cands = costPermanents(g, player, (id) => p.filter(ctx, id));
        if (!cands.length) return false;
        const [id] = yield* chooseItems(g, player, `Devolva ${p.label} que você controla à mão de seu dono`, cands.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
        info.returned = yield* moveObjects(g, [{ id: Number(id), to: 'hand' }], 'cost', player);
        break;
      }
      case 'loyalty': {
        const n = p.n === 'X' ? -x : p.n;
        if (n > 0) addCounters(g, { kind: 'obj', id: source }, 'loyalty', n, player);
        else if (n < 0) removeCounters(g, { kind: 'obj', id: source }, 'loyalty', -n);
        break;
      }
      case 'returnLand': break;
      case 'returnUnblockedAttacker': {
        const cands = unblockedAttackers(g, player);
        if (!cands.length) return false;
        const [id] = yield* chooseItems(g, player, `Devolva à mão ${p.label ?? 'um atacante não bloqueado que você controla'}`, cands.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
        const atk = s.combat?.attackers.find((a) => a.id === Number(id));
        info.returnedAttacker = { obj: Number(id), target: atk ? { ...atk.target } : null };
        info.returned = yield* moveObjects(g, [{ id: Number(id), to: 'hand' }], 'cost', player);
        break;
      }
      case 'revealSelf': {
        const o = s.objects[source];
        if (!o) return false;
        o.visibleTo = 'all';
        g.bump();
        g.log(`${s.players[player].name} revela ${nameOf(g, source)}${o.zone === 'command' ? ' da zona de comando' : ' da mão'}.`, { rule: '702.49b' });
        break;
      }
    }
  }
  return info;
}

/** escolhe X para custos com X (CR 107.3a) */
export function* chooseX(g: G, player: PlayerId, max: number, label: string): Gen<number> {
  return yield* chooseNumber(g, player, `Escolha o valor de X para ${label}`, 0, Math.max(0, max));
}

export function manaPart(parts: CostPart[]): ManaSymbol[] {
  const m = parts.find((p) => p.k === 'mana') as { k: 'mana'; cost: string } | undefined;
  return m ? parseCost(m.cost) : [];
}

export { removeCounters };
