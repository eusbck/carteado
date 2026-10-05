// Mecânicas com palavra própria usadas pelas cartas da parte B: transformar, proliferar,
// resguardo. Cada uma segue a regra citada.

import { addCounters, blight, exile, moveObjects, putOntoBattlefield, removeCounters, removeFromCombat, sacrifice } from './actions.ts';
import { parseCost } from './mana.ts';
import { addEffect } from './state.ts';
import { shuffle } from './rng.ts';
import { chooseItems, objItem, playerItem, yesNo } from './ask.ts';
import { chars, controllerOf, currentFace, isCreature, isLand, isTransform, nameOf, printedChars } from './chars.ts';
import { payMana } from './costs.ts';

import { defineAbility, type AbilityDef, type ActivatedDef, type AdditionalCostDef, type Gen, type ReplacementDef, type StaticDef, type TriggeredDef } from './defs.ts';
import { activated, asEnters, keyword, on, t, tgt, triggered } from './dsl.ts';
import { delayed, mayPay, nextEndStepTrigger, untilEndOfTurn } from './efeitos.ts';
import type { G } from './game-context.ts';
import { castSpell, copySpell, counter } from './stack.ts';
import { emit } from './triggers.ts';
import type { ChoiceItem, CopyValues, Duration, ManaSymbol, Mod, ObjId, PlayerId } from './types.ts';

// ---------------------------------------------------------------------------
// Transformar (CR 701.28)
// ---------------------------------------------------------------------------
/**
 * Vira a carta de duas faces para a outra face. Só cartas que transformam podem (701.28c);
 * a face que fica para cima é a que vale no campo (712.8a). Não é um objeto novo (701.28d).
 */
export function transform(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || o.faceDown || !isTransform(o.def)) return false;
  o.face = o.face === 0 ? 1 : 0;
  g.log(`${nameOf(g, id)}: transforma.`, { rule: '701.28' });
  g.bump();
  emit(g, [{ type: 'transform', obj: id, to: o.face }]);
  return true;
}

/**
 * "Transforme [este permanente]" dito por uma habilidade dele: só transforma se ainda estiver
 * com a face em que a habilidade estava (CR 701.28f — se já transformou desde que a habilidade
 * foi para a pilha, nada acontece).
 */
export function transformFrom(g: G, id: ObjId, face: number): boolean {
  const o = g.state.objects[id];
  if (!o || o.face !== face) return false;
  return transform(g, id);
}

// ---------------------------------------------------------------------------
// Proliferar (CR 701.34)
// ---------------------------------------------------------------------------
/** escolha qualquer número de permanentes e/ou jogadores com marcadores; cada um ganha mais um de cada tipo que já tem */
export function* proliferate(g: G, p: PlayerId): Gen<void> {
  const s = g.state;
  const itens: ChoiceItem[] = [];
  for (const id of s.zones.battlefield) {
    const o = s.objects[id];
    if (!o.phasedOut && Object.values(o.counters).some((n) => n > 0)) itens.push(objItem(g, id, nameOf(g, id)));
  }
  for (const pl of s.players) if (!pl.left && Object.values(pl.counters).some((n) => n > 0)) itens.push(playerItem(g, pl.id));
  g.log(`${s.players[p].name} prolifera.`, { rule: '701.34' });
  if (itens.length === 0) return;
  const escolhidos = yield* chooseItems(g, p, 'Proliferar: escolha os permanentes e jogadores que ganham mais um marcador de cada tipo', itens, 0, itens.length);
  for (const sel of escolhidos) {
    const it = itens.find((x) => x.id === sel)!;
    const alvo = it.player !== undefined ? { kind: 'player' as const, id: it.player } : { kind: 'obj' as const, id: it.obj! };
    const marcadores = it.player !== undefined ? s.players[it.player].counters : s.objects[it.obj!]?.counters ?? {};
    for (const [tipo, n] of Object.entries({ ...marcadores })) if (n > 0) addCounters(g, alvo, tipo, 1, p);
  }
}

// ---------------------------------------------------------------------------
// Resguardo (CR 702.21)
// ---------------------------------------------------------------------------
/** custo de resguardo: custo de mana ("{2}") ou "blight:N" (Ward—Blight N) */
function textoCusto(custo: string): string {
  const b = custo.match(/^blight:(\d+)$/);
  return b ? `blight ${b[1]}` : custo;
}

function gatilhoResguardo(custo: string): TriggeredDef {
  return triggered(on.batch((evs, c) => {
    // CR 702.21a: alvo de mágica ou habilidade de um oponente; mirar o mesmo permanente
    // várias vezes com a mesma mágica é um só "tornar-se alvo"
    const e = evs.find((x) => x.type === 'target' && x.target.kind === 'obj' && x.target.id === c.source && c.g.isOpponent(c.you, x.controller));
    return e && e.type === 'target' ? { alvoDe: e.by, quem: e.controller } : false;
  }), function* (c) {
    const by = c.event.alvoDe as ObjId;
    const quem = c.event.quem as PlayerId;
    if (c.g.state.objects[by]?.zone !== 'stack') return;
    let pagou = false;
    const b = custo.match(/^blight:(\d+)$/);
    if (b) {
      const temCriatura = c.g.state.zones.battlefield.some((id) => isCreature(c.g, id) && controllerOf(c.g, id) === quem);
      if (temCriatura && (yield* yesNo(c.g, quem, `Resguardo de ${nameOf(c.g, c.source)}: fazer blight ${b[1]} para não ter a mágica ou habilidade anulada?`))) {
        pagou = (yield* blight(c.g, quem, Number(b[1]))) !== null;
      }
    } else {
      pagou = yield* mayPay(c, quem, custo, `o resguardo de ${nameOf(c.g, c.source)}`);
    }
    if (!pagou) yield* counter(c.g, by);
  }, { text: `Resguardo — ${textoCusto(custo)} (sempre que este permanente se torna alvo de uma mágica ou habilidade de um oponente, anule-a, a menos que esse jogador pague ${textoCusto(custo)}).` });
}

/** resguardo impresso na carta: palavra-chave + o gatilho */
export function ward(custo: string): AbilityDef[] {
  return [keyword('ward', custo), gatilhoResguardo(custo)];
}

const resguardosConcedidos = new Map<string, string>();
/** id da habilidade de resguardo para conceder a outro permanente (Aura, equipamento) */
export function wardGranted(custo: string): string {
  let id = resguardosConcedidos.get(custo);
  if (!id) {
    id = `kw:ward:${custo}`;
    defineAbility(id, gatilhoResguardo(custo));
    resguardosConcedidos.set(custo, id);
  }
  return id;
}

export { chars };

// ---------------------------------------------------------------------------
// Cópia (CR 707.2, 707.3)
// ---------------------------------------------------------------------------
/** valores copiáveis: o que o objeto está copiando, ou a carta/ficha original na face em uso */
export function copiableValues(g: G, id: ObjId): CopyValues {
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  const copias = g.state.effects.filter((e) => e.affected?.includes(id) && e.mods.some((m) => m.k === 'copy')).sort((a, b) => a.timestamp - b.timestamp);
  const ultima = copias.at(-1)?.mods.find((m) => m.k === 'copy');
  if (ultima && ultima.k === 'copy') return structuredClone(ultima.of);
  if (o.copyOf) return structuredClone(o.copyOf);
  return { def: o.def, face: currentFace(o) };
}

// ---------------------------------------------------------------------------
// Conjurar sem pagar e gatilhos de conjuração
// ---------------------------------------------------------------------------
/** "Você pode conjurar [a carta] sem pagar o custo de mana" durante uma resolução (CR 608.2g, 118.9) */
export function* mayCastFree(g: G, p: PlayerId, card: ObjId, prompt?: string): Gen<boolean> {
  const o = g.state.objects[card];
  if (!o || isLand(g, card)) return false;
  if (!(yield* yesNo(g, p, prompt ?? `Conjurar ${nameOf(g, card)} sem pagar o custo de mana?`))) return false;
  const r = yield* castSpell(g, p, card, { key: 'free', label: 'sem pagar o custo de mana', zone: o.zone, free: true, duringResolution: true });
  return r !== null;
}

/** "Quando você conjura esta mágica" (a habilidade funciona na pilha, CR 113.6c) */
export function onCastThis(effect: TriggeredDef['effect'], text: string): TriggeredDef {
  return triggered(on.custom((e, c) => (e.type === 'cast' && e.obj === c.source ? { spell: e.obj } : false)), effect, { zones: ['stack'], text });
}

/** quantas vezes um custo adicional foi pago, olhando a mágica (ou a última informação dela) */
export function timesPaid(g: G, spell: ObjId, key: string): number {
  const o = g.state.objects[spell] ?? g.state.lki[spell]?.obj;
  const v = o?.stack?.paid[key];
  return typeof v === 'number' ? v : v ? 1 : 0;
}

/** Replicar [custo] (CR 702.56): custo adicional repetível + gatilho de conjuração que copia */
export function replicate(custo: string): { cost: AdditionalCostDef; trigger: TriggeredDef } {
  return {
    cost: { key: 'replicar', label: `replicar ${custo}`, parts: [{ k: 'mana', cost: custo }], optional: true, repeatable: true },
    trigger: onCastThis(function* (c) {
      const n = timesPaid(c.g, c.source, 'replicar');
      for (let i = 0; i < n; i++) yield* copySpell(c.g, c.source, c.you, { newTargets: true });
    }, `Replicar ${custo} (quando você conjura esta mágica, copie-a para cada vez que pagou o custo de replicar; as cópias podem ter novos alvos).`),
  };
}

/** Demonstrar (CR 702.144): você pode copiar; se copiar, um oponente que você escolhe também copia */
export function demonstrate(): TriggeredDef {
  return onCastThis(function* (c) {
    if (!(yield* yesNo(c.g, c.you, `Demonstrar: copiar ${nameOf(c.g, c.source)}?`))) return;
    yield* copySpell(c.g, c.source, c.you, { newTargets: true });
    const ops = c.g.opponents(c.you);
    if (ops.length === 0) return;
    const [op] = yield* chooseItems(c.g, c.you, 'Demonstrar: escolha um oponente para também copiar a mágica', ops.map((p) => playerItem(c.g, p)), 1, 1);
    const quem = Number(op.slice(1));
    yield* copySpell(c.g, c.source, quem, { newTargets: true });
  }, 'Demonstrar (quando você conjura esta mágica, você pode copiá-la; se fizer isso, escolha um oponente para também copiá-la).');
}

/** Gravestorm (CR 702.69): copia para cada permanente que foi do campo para um cemitério neste turno */
export function gravestorm(): TriggeredDef {
  return onCastThis(function* (c) {
    const n = c.g.state.players.reduce((t, p) => t + (c.g.state.turnStats[p.id]?.permanentsToGraveyard ?? 0), 0);
    for (let i = 0; i < n; i++) yield* copySpell(c.g, c.source, c.you, { newTargets: true });
  }, 'Gravestorm (quando você conjura esta mágica, copie-a para cada permanente que foi do campo para um cemitério neste turno).');
}

/** mágica instantânea ou feitiço (para magecraft e afins) */
export function isInstantOrSorcery(g: G, id: ObjId): boolean {
  const c = g.state.objects[id] ? chars(g, id) : g.state.lki[id]?.chars;
  return !!c && (c.types.includes('Instant') || c.types.includes('Sorcery'));
}

/** Magecraft: "sempre que você conjura ou copia uma mágica instantânea ou feitiço" */
export function magecraft(effect: TriggeredDef['effect'], text: string): TriggeredDef {
  return triggered(on.custom((e, c) => ((e.type === 'cast' || e.type === 'copySpell') && e.player === c.you && isInstantOrSorcery(c.g, e.obj) ? { spell: e.obj } : false)), effect, { text: `Magecraft — ${text}` });
}

// ---------------------------------------------------------------------------
// Permissões e afins
// ---------------------------------------------------------------------------
/** "você pode jogar/conjurar essas cartas [até ...]" (CR 601.2a, 305.1) */
export function allowPlay(g: G, controller: PlayerId, source: ObjId, cards: ObjId[], duration: Duration, opts: { free?: boolean; anyType?: boolean; once?: boolean; spellsOnly?: boolean; bottomInstead?: boolean } = {}): void {
  if (cards.length === 0) return;
  addEffect(g, { source, sourceDef: '', controller, duration, affected: null, mods: [{ k: 'rule', id: 'rule:mayPlay', params: { objs: cards, player: controller, ...opts } }] });
}

/** Aura que goada a criatura encantada enquanto estiver anexada (CR 701.15) */
export function goadsEnchanted(text = 'A criatura encantada está goadada (ataca a cada combate se puder, e ataca um jogador que não você se puder).'): StaticDef {
  return { kind: 'static', text, rules: { goads: (c, obj) => c.g.state.objects[c.source]?.attachedTo === obj } };
}

/** Descobrir N (CR 701.57) */
export function* discover(g: G, p: PlayerId, n: number): Gen<void> {
  const s = g.state;
  const lib = s.zones.library[p];
  const i = lib.findIndex((id) => !isLand(g, id) && chars(g, id).manaValue <= n);
  const tiradas = i < 0 ? [...lib] : lib.slice(0, i + 1);
  g.log(`${s.players[p].name} descobre ${n}: exila ${tiradas.map((id) => nameOf(g, id)).join(', ') || 'nada'}.`, { rule: '701.57' });
  const novos = (yield* moveObjects(g, tiradas.map((id) => ({ id, to: 'exile' as const })), 'discover')).filter((x): x is ObjId => x !== null);
  const achada = i < 0 ? null : novos[novos.length - 1] ?? null;
  if (achada !== null) {
    const conjurou = yield* mayCastFree(g, p, achada, `Descobrir: conjurar ${nameOf(g, achada)} sem pagar o custo de mana? (senão, ela vai para a sua mão)`);
    if (!conjurou && g.state.objects[achada]?.zone === 'exile') yield* moveObjects(g, [{ id: achada, to: 'hand' }], 'discover');
  }
  const resto = shuffle(s.rng, novos.filter((id) => id !== achada && s.objects[id]?.zone === 'exile'));
  if (resto.length) yield* moveObjects(g, resto.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'discover');
}

// ---------------------------------------------------------------------------
// Aniquilador (CR 702.86)
// ---------------------------------------------------------------------------
function gatilhoAniquilador(n: number): TriggeredDef {
  return triggered(on.selfAttacks(), function* (c) {
    const cb = c.g.state.combat?.attackers.find((a) => a.id === c.source);
    if (!cb) return;
    // jogador defensor: o atacado, ou o controlador do planeswalker atacado (CR 506.2, 508.5)
    const def = cb.target.kind === 'player' ? cb.target.id : c.g.state.objects[cb.target.id] ? controllerOf(c.g, cb.target.id) : null;
    if (def === null || c.g.state.players[def].left) return;
    const meus = c.g.state.zones.battlefield.filter((id) => controllerOf(c.g, id) === def && !c.g.state.objects[id].phasedOut);
    if (meus.length === 0) return;
    const k = Math.min(n, meus.length);
    const pick = meus.length <= n ? meus.map(String) : yield* chooseItems(c.g, def, `Aniquilador ${n}: sacrifique ${n} permanentes`, meus.map((id) => objItem(c.g, id, nameOf(c.g, id))), k, k);
    yield* sacrifice(c.g, pick.map(Number));
  }, { text: `Aniquilador ${n} (sempre que esta criatura ataca, o jogador defensor sacrifica ${n} permanentes).` });
}

/** aniquilador impresso */
export function annihilator(n: number): AbilityDef[] {
  return [keyword('annihilator', n), gatilhoAniquilador(n)];
}

const aniquiladoresConcedidos = new Map<number, string>();
/** id do gatilho de aniquilador para conceder (Eldrazi Conscription) */
export function annihilatorGranted(n: number): string {
  let id = aniquiladoresConcedidos.get(n);
  if (!id) {
    id = `kw:annihilator:${n}`;
    defineAbility(id, gatilhoAniquilador(n));
    aniquiladoresConcedidos.set(n, id);
  }
  return id;
}

/**
 * CR 702.26: sair de fase. O que estiver anexado sai junto, indiretamente (702.26g), e volta
 * com o hospedeiro na etapa de desvirar do controlador dele. Sai do combate (CR 506.4).
 */
export function phaseOut(g: G, ids: ObjId[]): void {
  const s = g.state;
  const fora: ObjId[] = [];
  const sai = (id: ObjId, por: PlayerId): void => {
    const o = s.objects[id];
    if (!o || o.zone !== 'battlefield' || o.phasedOut) return;
    o.phasedOut = true;
    o.data.phasedOutBy = por;
    fora.push(id);
    removeFromCombat(g, id);
    for (const a of s.zones.battlefield) if (s.objects[a].attachedTo === id) sai(a, por);
  };
  for (const id of ids) sai(id, controllerOf(g, id));
  if (fora.length) { emit(g, fora.map((obj) => ({ type: 'phaseOut' as const, obj }))); g.bump(); }
}

/**
 * CR 702.165: Apoio N — quando entra, N marcadores +1/+1 na criatura alvo; se for outra criatura,
 * ela ganha até o fim do turno as habilidades impressas abaixo do apoio (702.165a, rulings 3-4).
 */
export function backup(n: number, grants: () => Mod[]): TriggeredDef {
  return triggered(on.selfEnters(), function* (c) {
    const id = tgt(c);
    if (id === null) return;
    addCounters(c.g, { kind: 'obj', id }, '+1/+1', n, c.you);
    if (id !== c.source) untilEndOfTurn(c, [id], grants());
  }, { targets: [t.creature(undefined, 'criatura alvo do apoio')], text: `Apoio ${n} (quando entra, coloque ${n} marcador(es) +1/+1 na criatura alvo; se for outra criatura, ela ganha as habilidades abaixo até o fim do turno)` });
}

/**
 * CR 702.83: Exaltado — sempre que uma criatura que você controla ataca sozinha (é a única
 * declarada como atacante, 702.83b), ela recebe +1/+1 até o fim do turno. Cada instância dispara.
 */
export function exalted(): TriggeredDef {
  const a = triggered(on.custom((e, c) => (e.type === 'attackers' && e.player === c.you && e.attackers.length === 1 ? { criatura: e.attackers[0].obj } : false)), function* (c) {
    const id = c.event.criatura as ObjId;
    if (c.g.state.objects[id]?.zone === 'battlefield') untilEndOfTurn(c, [id], [{ k: 'pt', p: 1, t: 1 }]);
  }, { text: 'Exaltado (sempre que uma criatura que você controla ataca sozinha, ela recebe +1/+1 até o fim do turno)' });
  a.kw = 'exalted';
  return a;
}

/**
 * CR 702.82: Devorar N — ao entrar, você pode sacrificar quantas criaturas quiser (só as que já
 * estão no campo, nunca ela mesma); ela entra com N marcadores +1/+1 por criatura sacrificada.
 */
export function devour(n: number): ReplacementDef {
  return asEnters(function* (c, ev) {
    const s = c.g.state;
    const cands = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && id !== ev.obj && isCreature(c.g, id) && controllerOf(c.g, id) === ev.controller);
    if (!cands.length) return;
    const esc = (yield* chooseItems(c.g, ev.controller, `Devorar ${n}: escolha as criaturas para sacrificar (${n} marcador(es) +1/+1 por criatura)`, cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, cands.length)).map(Number);
    if (!esc.length) return;
    const sac = (yield* sacrifice(c.g, esc)).filter((x) => x !== null);
    ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + n * sac.length;
    ev.choices.devorou = sac.length;
  }, `Devorar ${n} (ao entrar, você pode sacrificar quantas criaturas quiser; ela entra com ${n} marcador(es) +1/+1 por criatura sacrificada)`);
}

/** CR 701.40a: manifestar — a carta do topo do grimório entra virada para baixo como criatura 2/2 */
export function* manifest(g: G, p: PlayerId): Gen<ObjId | null> {
  const topo = g.state.zones.library[p][0];
  if (topo === undefined || g.state.players[p].left) return null;
  const [id] = yield* putOntoBattlefield(g, [{ id: topo, controller: p, faceDown: true, data: { manifestada: true } }], 'manifest');
  if (id !== undefined) g.log(`${g.state.players[p].name} manifesta a carta do topo do grimório.`, { rule: '701.40' });
  return id ?? null;
}

/**
 * CR 701.40a, 116.2b: custo de mana para virar para cima uma permanente manifestada, se a carta
 * for de criatura (ruling: vale mesmo que tenha perdido as habilidades); null se não pode.
 */
export function manifestFaceUpCost(g: G, id: ObjId): ManaSymbol[] | null {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || !o.faceDown || !o.data.manifestada) return null;
  const pc = printedChars(o.def, 0, o.owner);
  return pc.types.includes('Creature') && pc.manaCost ? pc.manaCost : null;
}

/** ação especial de virar para cima (CR 116.2b, 708.8): não usa a pilha e não é "entrar no campo" */
export function* turnFaceUp(g: G, p: PlayerId, id: ObjId): Gen<boolean> {
  const custo = manifestFaceUpCost(g, id);
  if (custo === null || controllerOf(g, id) !== p) return false;
  const pago = yield* payMana(g, p, custo, { purpose: { kind: 'effect' }, canCancel: true, label: `virar ${nameOf(g, id)} para cima` });
  if (pago === null) return false;
  const o = g.state.objects[id];
  o.faceDown = false;
  delete o.data.manifestada;
  g.bump();
  g.log(`${g.state.players[p].name} vira para cima ${nameOf(g, id)}.`, { rule: '701.40a' });
  emit(g, [{ type: 'turnedFaceUp', obj: id }]);
  return true;
}

/**
 * CR 702.62: Suspender N—[custo]. Três habilidades: a estática que permite exilar da mão com N
 * marcadores de tempo pagando o custo (ação especial, 116.2f), o gatilho de manutenção que
 * remove um marcador e o gatilho que, ao sair o último, permite conjurá-la sem pagar (702.62a).
 */
export function suspend(n: number, custo: string): AbilityDef[] {
  return [
    { kind: 'static', kw: 'suspend', param: { n, custo }, text: `Suspender ${n}—${custo} (em vez de conjurar da mão, pague ${custo} e exile-a com ${n} marcadores de tempo; na sua manutenção, remova um; ao remover o último, você pode conjurá-la sem pagar o custo de mana)` },
    triggered(on.upkeep('you'), function* (c) {
      removeCounters(c.g, { kind: 'obj', id: c.source }, 'time', 1);
    }, {
      zones: ['exile'],
      condition: (c) => { const o = c.g.state.objects[c.source]; return !!o && o.zone === 'exile' && (o.counters.time ?? 0) > 0; },
      text: 'No início da sua manutenção, se esta carta estiver suspensa, remova um marcador de tempo dela.',
    }),
    // ruling: não importa por que o último marcador saiu
    triggered(on.custom((e, c) => e.type === 'countersRemoved' && e.kind === 'time' && e.target.kind === 'obj' && e.target.id === c.source && (c.g.state.objects[c.source]?.counters.time ?? 0) === 0), function* (c) {
      // ignora o tempo de feitiço; sem pagar o custo de mana (X = 0)
      if (c.g.state.objects[c.source]?.zone === 'exile') yield* mayCastFree(c.g, c.you, c.source);
    }, { zones: ['exile'], text: 'Quando o último marcador de tempo for removido, você pode conjurá-la sem pagar o custo de mana.' }),
  ];
}

/** parâmetros de suspender da carta na mão, se tiver */
export function suspendParams(g: G, id: ObjId): { n: number; custo: string } | null {
  const o = g.state.objects[id];
  if (!o) return null;
  const k = chars(g, id).abilities.find((a) => a.kw === 'suspend');
  return (k?.param as { n: number; custo: string } | undefined) ?? null;
}

/** ação especial de suspender (CR 116.2f): paga o custo e exila com os marcadores de tempo */
export function* doSuspend(g: G, p: PlayerId, id: ObjId): Gen<boolean> {
  const prm = suspendParams(g, id);
  const o = g.state.objects[id];
  if (!prm || !o || o.zone !== 'hand' || o.owner !== p) return false;
  const pago = yield* payMana(g, p, parseCost(prm.custo), { purpose: { kind: 'effect' }, canCancel: true, label: `suspender ${nameOf(g, id)}` });
  if (pago === null) return false;
  const [ex] = yield* exile(g, [id]);
  if (ex === null || ex === undefined) return true;
  addCounters(g, { kind: 'obj', id: ex }, 'time', prm.n, p);
  g.log(`${g.state.players[p].name} suspende ${nameOf(g, ex)} com ${prm.n} marcadores de tempo.`, { rule: '702.62a' });
  return true;
}

/** fim do desenterrar: exila no início da próxima etapa final (CR 702.84a) */
const DESENTERRAR_EXILA = defineAbility('kw:unearthExile', nextEndStepTrigger(function* (c) {
  const id = c.data.obj as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield') yield* exile(c.g, [id]);
}, 'Exile a criatura desenterrada.'));

/**
 * CR 702.84: Desenterrar [custo] — do cemitério, só como feitiço: volta ao campo com ímpeto; é
 * exilada no início da próxima etapa final ou se fosse sair do campo (substituição, 702.84a).
 */
export function unearth(custo: string): ActivatedDef {
  const a = activated(custo, function* (c) {
    if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
    const [novo] = yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you }], 'effect');
    if (novo === undefined) return;
    addEffect(c.g, {
      source: novo, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: novo }, affected: [novo],
      mods: [{ k: 'addKeyword', kw: 'haste' }, { k: 'rule', id: 'rule:exileIfLeaves' }],
    });
    delayed(c, DESENTERRAR_EXILA.id!, { data: { obj: novo } });
  }, { zones: ['graveyard'], timing: 'sorcery', text: `Desenterrar ${custo} (${custo}: devolva esta carta do seu cemitério ao campo. Ela ganha ímpeto. Exile-a no início da próxima etapa final ou se fosse sair do campo. Só como feitiço.)` });
  a.kw = 'unearth';
  return a;
}

/**
 * CR 702.30: Eco [custo] — no início da sua manutenção, se o permanente ficou sob seu controle
 * desde o início da sua última manutenção, sacrifique-o a menos que pague o custo. "Desde a
 * última manutenção" = ainda não passou por uma manutenção sua sob o controle atual.
 */
export function echo(custo: string): TriggeredDef {
  const pendente = (c: { g: G; source: ObjId }): boolean => {
    const o = c.g.state.objects[c.source];
    return !!o && o.data.ecoVisto !== o.controlledSince;
  };
  return triggered(on.upkeep('you'), function* (c) {
    const o = c.g.state.objects[c.source];
    if (!o) return;
    o.data.ecoVisto = o.controlledSince;
    if (!(yield* mayPay(c, c.you, custo, `pagar o eco de ${nameOf(c.g, c.source)}`))) yield* sacrifice(c.g, [c.source]);
  }, { condition: pendente, text: `Eco ${custo} (no início da sua manutenção, se isto ficou sob seu controle desde a sua última manutenção, sacrifique-o a menos que pague o custo de eco)` });
}

// ---------------------------------------------------------------------------
// Bravura (CR 702.108)
// ---------------------------------------------------------------------------
/** CR 702.108a: "Sempre que você conjura uma mágica que não é de criatura, esta criatura recebe +1/+1 até o fim do turno" */
export function prowess(): AbilityDef[] {
  return [
    keyword('prowess'),
    triggered(on.custom((e, c) => e.type === 'cast' && e.player === c.you && !!c.g.state.objects[e.obj] && !isCreature(c.g, e.obj)), function* (c) {
      if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 1, t: 1 }]);
    }, { text: 'Bravura (sempre que você conjura uma mágica que não é de criatura, esta criatura recebe +1/+1 até o fim do turno).' }),
  ];
}
