// Immoral Bargain
// As an additional cost to cast this spell, sacrifice X creatures.
// Destroy X target nonland permanents.
import { additionalCost, defineCard, destroy, is, t } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Immoral Bargain',
  faces: [{
    additionalCosts: [additionalCost('sacrificar', 'sacrificar X criaturas', [{ k: 'sacrifice', n: 'X', filter: is.creature, label: 'criatura' }])],
    spell: {
      // X é escolhido ao conjurar (CR 601.2b): no máximo o número de criaturas que você pode sacrificar
      xMax: (c) => c.g.state.zones.battlefield.filter((id) => is.creature(c, id) && is.yours(c, id)).length,
      targets: [{ ...t.nonlandPermanent(undefined, 'X permanentes não terreno alvo'), min: 0, max: (c) => c.x ?? 0 }],
      *effect(c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield' ? [r.id as ObjId] : []));
        if (ids.length) yield* destroy(c.g, ids);
      },
    },
  }],
});
