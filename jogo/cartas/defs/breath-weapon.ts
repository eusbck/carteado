// Breath Weapon
// Breath Weapon deals 2 damage to each non-Dragon creature.
import { allCreatures, chars, dealDamage, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Breath Weapon',
  faces: [{
    spell: {
      *effect(c) {
        // CR 120.3: o dano é causado ao mesmo tempo a todas as criaturas que não são Dragon na resolução
        const alvos = allCreatures(c.g).filter((id) => !chars(c.g, id).subtypes.includes('Dragon'));
        dealDamage(c.g, alvos.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 2, combat: false })));
      },
    },
  }],
  rulings: {},
});
