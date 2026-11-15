// Curar (CR 701.69a) e substituir dano por dano com cura do que já estava marcado (CR 614.1a).
import { hooks } from './chars.ts';
import type { G } from './game-context.ts';
import type { ObjId, TargetRef } from './types.ts';

/** Remove apenas dano marcado. Não regenera, não remove marcadores nem desfaz toque mortífero (CR 704.5h). */
export function healDamage(g: G, id: ObjId): number {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || o.phasedOut) return 0;
  const healed = o.damage;
  o.damage = 0;
  if (healed > 0) g.bump();
  return healed;
}

/**
 * CR 120.4b, 614.5: cura uma vez por destinatário no evento de dano simultâneo, preservando todo o dano novo.
 * Vem antes das prevenções: se a cura e a prevenção forem aplicáveis, usa a ordem que também cura o dano anterior.
 */
export function healPreviousDamage(g: G, target: TargetRef, source: ObjId, combat: boolean, healed: Set<ObjId>): void {
  if (target.kind !== 'obj' || healed.has(target.id)) return;
  if (!hooks(g, 'healsPreviousDamage').some((h) => h.fn(h.ctx, target, source, combat))) return;
  healed.add(target.id);
  healDamage(g, target.id);
}
