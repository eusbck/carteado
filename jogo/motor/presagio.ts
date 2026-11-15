// Final de resolução de presságios (CR 720.3c-d): até uma cópia é movida para o grimório e embaralhada,
// antes de deixar de existir pela ação baseada em estado de CR 704.5e.
import { moveObject, shuffleLibrary } from './actions.ts';
import { nameOf } from './chars.ts';
import type { Gen } from './defs.ts';
import type { G } from './game-context.ts';
import { jog, obj, reg } from './registro.ts';
import type { ObjId } from './types.ts';

export function* resolveOmen(g: G, id: ObjId): Gen<void> {
  const o = g.state.objects[id];
  if (o?.zone !== 'stack' || !o.stack?.data.omen) return;
  const dono = o.owner;
  reg(g, 'zona', { rule: '720.3d' })`${obj(id, undefined, nameOf(g, id))} é embaralhada no grimório de ${jog(dono)} (presságio).`;
  yield* moveObject(g, id, 'library', 'omen');
  shuffleLibrary(g, dono);
}
