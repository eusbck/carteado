// Mecânicas com palavra própria usadas pelas cartas da parte B: transformar, proliferar,
// resguardo. Cada uma segue a regra citada.

import { addCounters, blight } from './actions.ts';
import { chooseItems, objItem, playerItem, yesNo } from './ask.ts';
import { chars, controllerOf, currentFace, isCreature, isTransform, nameOf } from './chars.ts';
import { defineAbility, type AbilityDef, type Gen, type TriggeredDef } from './defs.ts';
import { keyword, on, triggered } from './dsl.ts';
import { mayPay } from './efeitos.ts';
import type { G } from './game-context.ts';
import { counter } from './stack.ts';
import { emit } from './triggers.ts';
import type { ChoiceItem, CopyValues, ObjId, PlayerId } from './types.ts';

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
