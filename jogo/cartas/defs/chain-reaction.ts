// Chain Reaction
// Chain Reaction deals X damage to each creature, where X is the number of creatures on the battlefield.
import { allCreatures, dealDamage, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Chain Reaction',
  faces: [{
    spell: {
      *effect(c) {
        const todas = allCreatures(c.g);
        const x = todas.length; // CR 608.2h: determinado na resolução (ruling 1)
        dealDamage(c.g, todas.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: x, combat: false })));
      },
    },
  }],
  rulings: { 1: 'teste: X é o número de criaturas na resolução' },
});
