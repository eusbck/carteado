// Fling
// As an additional cost to cast this spell, sacrifice a creature.
// Fling deals damage equal to the sacrificed creature's power to any target.
import { additionalCost, dealDamage, defineCard, is, lkiChars, t, tgtRef } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Fling',
  faces: [{
    // ruling 2: exatamente uma criatura, obrigatório (CR 118.8); ruling 3: é custo, pago antes de alguém responder
    additionalCosts: [additionalCost('sacrificar', 'sacrificar uma criatura', [{ k: 'sacrifice', n: 1, filter: is.creature, label: 'uma criatura' }])],
    spell: {
      targets: [t.any()],
      *effect(c) {
        const alvo = tgtRef(c);
        if (!alvo) return;
        const sac = ((c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? [])[0];
        // ruling 1: a força da criatura como ela existiu no campo pela última vez (CR 608.2h)
        const x = sac !== undefined ? lkiChars(c.g, sac)?.power ?? 0 : 0;
        if (x > 0) dealDamage(c.g, [{ source: c.source, target: alvo, amount: x, combat: false }]);
      },
    },
  }],
  rulings: {
    1: 'teste: o dano é a força da criatura sacrificada como estava no campo',
    2: 'teste: sem criatura para sacrificar, não pode ser conjurada',
    3: 'regra geral: CR 601.2h — os custos são pagos ao conjurar, antes de alguém poder responder (motor/stack.ts)',
  },
});
