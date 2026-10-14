// Peças repetidas nas cartas do deck Tramplesaurus Rex (Ghalta): força total, "força 4 ou mais" (feroz) e a maior força.
import { creaturesOf, isCreature, on, power, triggered } from '../motor/api.ts';
import type { FaceDef, TriggeredDef } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** força total das criaturas que o jogador controla; força negativa subtrai (ruling 3 de Ghalta, ruling 1 de Surrak) */
export function forcaTotal(g: G, p: PlayerId): number {
  return creaturesOf(g, p).reduce((n, id) => n + power(g, id), 0);
}

/** "se você controla uma criatura com força 4 ou mais" (feroz) */
export function temForca4(g: G, p: PlayerId, minimo = 4): boolean {
  return creaturesOf(g, p).some((id) => power(g, id) >= minimo);
}

/** a maior força entre as criaturas que o jogador controla (0 sem criaturas) */
export function maiorForca(g: G, p: PlayerId, ids: ObjId[] = creaturesOf(g, p)): number {
  return ids.reduce((m, id) => Math.max(m, power(g, id)), 0);
}

/**
 * Presente num permanente (CR 702.174b): "quando entra, se o custo do presente foi pago, [o presente]". O oponente
 * escolhido ao conjurar chega no objeto em data.spell.giftTo (motor/stack.ts). Uma cópia que entra não tem o presente
 * prometido (ruling 6 de Scrapshooter), porque não veio da mágica.
 */
export function presentePrometidoA(g: G, id: ObjId): PlayerId | null {
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  const sp = o?.data.spell as { paid?: Record<string, unknown>; giftTo?: PlayerId } | undefined;
  return sp?.paid?.gift && sp.giftTo !== undefined ? sp.giftTo : null;
}

export function presenteAoEntrar(gift: NonNullable<FaceDef['gift']>, texto: string): TriggeredDef {
  return triggered(on.selfEnters(), function* (c) {
    const para = presentePrometidoA(c.g, c.source);
    if (para === null || c.g.state.players[para].left) return;
    c.g.log(`${c.g.state.players[para].name} recebe o presente: ${gift.label}.`, { rule: '702.174b' });
    yield* gift.give(c, para);
  }, { condition: (c) => presentePrometidoA(c.g, c.source) !== null, text: texto });
}

/** "você controla a criatura com a maior força ou empatada com a maior" (Thickest in the Thicket) */
export function controlaMaiorForca(g: G, p: PlayerId): boolean {
  const minhas = creaturesOf(g, p);
  if (!minhas.length) return false;
  const maiorMinha = Math.max(...minhas.map((id) => power(g, id)));
  const outras = g.state.zones.battlefield.filter((id) => !minhas.includes(id) && !g.state.objects[id].phasedOut && isCreature(g, id));
  return outras.every((id) => power(g, id) <= maiorMinha);
}
