// Peças do semanal de 10-11/11/2026: exilar e devolver (piscar), assimilar e criaturas-artefato (cartas que o lote 3 não trouxe).
import { addEffect, chars, controllerOf, exile, isCreature, isType, putOntoBattlefield } from '../motor/api.ts';
import type { Ctx, Gen } from '../motor/defs.ts';
import { assimilateCard } from '../motor/assimilar.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

export const artefatoCriatura = (g: G, id: ObjId) => isCreature(g, id) && isType(g, id, 'Artifact');

/** Assimilar (texto de lembrete das cartas): usa o do motor (motor/assimilar.ts), o mesmo do deck do lote 3 */
export function* assimilar(c: Ctx, carta: ObjId): Gen<ObjId | null> {
  return yield* assimilateCard(c.g, c.you, carta, c.source);
}

/** "exile [permanente], depois devolva essa carta ao campo sob o controle de [quem]" (CR 610.3) */
export function* piscar(c: Ctx, id: ObjId, quem: 'voce' | 'dono'): Gen<ObjId | null> {
  const o = c.g.state.objects[id];
  if (!o || o.zone !== 'battlefield') return null;
  const dono: PlayerId = o.owner;
  const [ex] = yield* exile(c.g, [id]);
  if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile') return null;
  // fichas deixam de existir no exílio (CR 111.7)
  const [novo] = yield* putOntoBattlefield(c.g, [{ id: ex, controller: quem === 'voce' ? c.you : dono }], 'effect');
  return novo ?? null;
}

export { controllerOf };
