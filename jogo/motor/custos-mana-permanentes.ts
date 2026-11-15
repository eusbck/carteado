// CR 118.3, 601.2g-h: o plano de mana precisa reservar os permanentes usados para virar outros permanentes.
// Só participa de planos com tapPermanents; os demais mantêm o planejamento que já existia.
import { controllerOf, isCreature } from './chars.ts';
import type { ManaOption } from './costs.ts';
import type { G } from './game-context.ts';
import type { ObjId, PlayerId } from './types.ts';

/** null se duas partes disputam o mesmo recurso; senão anota as escolhas de virar para o pagamento automático. */
export function planManaPermanentTaps(g: G, player: PlayerId, plan: ManaOption[]): ManaOption[] | null {
  if (!plan.some((o) => o.def.cost.some((p) => p.k === 'tapPermanents'))) return plan;
  const reserved = new Set<ObjId>();
  for (const o of plan) if (o.def.cost.some((p) => p.k === 'tap')) {
    if (reserved.has(o.obj)) return null;
    reserved.add(o.obj);
  }
  const slots: { option: number; part: number; candidates: ObjId[] }[] = [];
  const removed = new Set<ObjId>();
  for (const [oi, o] of plan.entries()) {
    for (const [pi, p] of o.def.cost.entries()) {
      if (p.k !== 'tapPermanents' && p.k !== 'tapCreatures') continue;
      const ctx = { g, you: player, source: o.obj };
      const candidates = g.state.zones.battlefield.filter((id) => {
        const obj = g.state.objects[id];
        if (reserved.has(id) || removed.has(id) || obj.phasedOut || obj.tapped || controllerOf(g, id) !== player) return false;
        return p.k === 'tapPermanents' ? p.filter(ctx, id) : (p.includeSelf || id !== o.obj) && isCreature(g, id) && (!p.filter || p.filter(ctx, id));
      });
      const n = p.n === 'X' ? (o.def.xFromAlt ? o.alt.length : 0) : p.n;
      if (candidates.length < n) return null;
      for (let i = 0; i < n; i++) slots.push({ option: oi, part: pi, candidates });
    }
    if (o.def.cost.some((p) => p.k === 'sacrificeSelf' || p.k === 'exileSelf')) removed.add(o.obj);
  }
  // Emparelhamento bipartido: permite remanejar uma escolha sem reutilizar a mesma permanente.
  const assigned = new Map<ObjId, number>();
  function reserve(slot: number, seen: Set<ObjId>): boolean {
    for (const id of slots[slot].candidates) {
      if (seen.has(id)) continue;
      seen.add(id);
      const previous = assigned.get(id);
      if (previous === undefined || reserve(previous, seen)) { assigned.set(id, slot); return true; }
    }
    return false;
  }
  for (let i = 0; i < slots.length; i++) if (!reserve(i, new Set())) return null;
  const payments = plan.map(() => ({} as Record<number, ObjId[]>));
  for (const [id, i] of assigned) {
    const slot = slots[i];
    (payments[slot.option][slot.part] ??= []).push(id);
  }
  return plan.map((o, i) => Object.keys(payments[i]).length ? { ...o, tapPayments: payments[i] } : o);
}
