// Wave of Reckoning
// Each creature deals damage to itself equal to its power.
import { allCreatures, dealDamage, defineCard, power } from '../../motor/api.ts';

export default defineCard({
  name: 'Wave of Reckoning',
  faces: [{
    spell: {
      *effect(c) {
        // todo o dano ao mesmo tempo; cada criatura é a fonte do próprio dano (CR 120.2b)
        dealDamage(c.g, allCreatures(c.g).map((id) => ({ source: id, target: { kind: 'obj' as const, id }, amount: power(c.g, id), combat: false })));
      },
    },
  }],
  rulings: {},
});
