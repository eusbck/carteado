// Too Greedily, Too Deep
// Put target creature card from a graveyard onto the battlefield under your control. That creature deals damage equal to
// its power to each other creature.
import { allCreatures, dealDamage, defineCard, is, isCreature, power, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Too Greedily, Too Deep',
  faces: [{
    spell: {
      targets: [t.card('graveyard', is.creature, 'carta de criatura alvo de um cemitério', 'any')],
      *effect(c) {
        const carta = tgt(c);
        if (carta === null) return;
        const [novo] = yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
        // ruling 1: se no campo ela não for criatura, não tem força e não causa dano
        if (novo === undefined || !isCreature(c.g, novo)) return;
        const n = power(c.g, novo);
        const outras = allCreatures(c.g).filter((id) => id !== novo);
        if (n > 0 && outras.length) dealDamage(c.g, outras.map((id) => ({ source: novo, target: { kind: 'obj' as const, id }, amount: n, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 208.3 — o permanente que não é criatura não tem força e não causa o dano (cartas/defs/too-greedily-too-deep.ts)',
  },
});
