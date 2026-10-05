// Mecânicas com palavra própria usadas pelas cartas da parte B: transformar, proliferar,
// resguardo. Cada uma segue a regra citada.

import { addCounters, blight, moveObjects } from './actions.ts';
import { addEffect } from './state.ts';
import { shuffle } from './rng.ts';
import { chooseItems, objItem, playerItem, yesNo } from './ask.ts';
import { chars, controllerOf, currentFace, isCreature, isLand, isTransform, nameOf } from './chars.ts';
import { defineAbility, type AbilityDef, type AdditionalCostDef, type Gen, type StaticDef, type TriggeredDef } from './defs.ts';
import { keyword, on, triggered } from './dsl.ts';
import { mayPay } from './efeitos.ts';
import type { G } from './game-context.ts';
import { castSpell, copySpell, counter } from './stack.ts';
import { emit } from './triggers.ts';
import type { ChoiceItem, CopyValues, Duration, ObjId, PlayerId } from './types.ts';

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
export function allowPlay(g: G, controller: PlayerId, source: ObjId, cards: ObjId[], duration: Duration, opts: { free?: boolean; anyType?: boolean } = {}): void {
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
