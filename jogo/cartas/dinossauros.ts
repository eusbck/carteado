// Peças repetidas nas cartas do deck Tramplesaurus Rex (Ghalta): força total, "força 4 ou mais" (feroz) e a maior força.
import { creaturesOf, isCreature, power } from '../motor/api.ts';
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

/** "você controla a criatura com a maior força ou empatada com a maior" (Thickest in the Thicket) */
export function controlaMaiorForca(g: G, p: PlayerId): boolean {
  const minhas = creaturesOf(g, p);
  if (!minhas.length) return false;
  const maiorMinha = Math.max(...minhas.map((id) => power(g, id)));
  const outras = g.state.zones.battlefield.filter((id) => !minhas.includes(id) && !g.state.objects[id].phasedOut && isCreature(g, id));
  return outras.every((id) => power(g, id) <= maiorMinha);
}
