// Peças do deck The Borg Queen: assimilar, exilar e devolver (piscar), artefatos-criatura.
import { addEffect, chars, controllerOf, exile, isCreature, isType, putOntoBattlefield } from '../motor/api.ts';
import type { Ctx, Gen } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

export const artefatoCriatura = (g: G, id: ObjId) => isCreature(g, id) && isType(g, id, 'Artifact');

/**
 * Assimilar: põe a carta no campo sob o seu controle com um marcador +1/+1; ela é uma criatura-artefato Borg e perde os
 * outros tipos de criatura (texto de lembrete das cartas). Devolve o id no campo, ou null.
 */
export function* assimilar(c: Ctx, carta: ObjId): Gen<ObjId | null> {
  if (!c.g.state.objects[carta]) return null;
  const [novo] = yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you, counters: { '+1/+1': 1 } }], 'effect');
  if (novo === null || novo === undefined || c.g.state.objects[novo]?.zone !== 'battlefield') return null;
  const ch = chars(c.g, novo);
  const tipos = [...new Set([...ch.types, 'Artifact', 'Creature'])];
  // subtipos que não são de criatura ficam (de artefato, por exemplo); os de criatura viram só Borg
  const naoCriatura = ch.subtypes.filter((s) => ['Equipment', 'Vehicle', 'Spacecraft', 'Treasure', 'Food', 'Clue', 'Aura'].includes(s));
  addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, affected: [novo], duration: { kind: 'permanent' }, mods: [{ k: 'setTypes', types: tipos, subtypes: ['Borg', ...naoCriatura], keepSupertypes: true }] });
  c.g.log(`${c.g.state.players[c.you].name} assimila ${ch.name}.`);
  return novo;
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
