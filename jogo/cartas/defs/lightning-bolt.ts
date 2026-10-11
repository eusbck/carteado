// Lightning Bolt
// Lightning Bolt deals 3 damage to any target.
import { dealDamage, defineCard, t, tgtRef } from '../../motor/api.ts';

export default defineCard({
  name: 'Lightning Bolt',
  faces: [{
    spell: {
      targets: [t.any()],
      *effect(c) {
        const alvo = tgtRef(c);
        if (alvo) dealDamage(c.g, [{ source: c.source, target: alvo, amount: 3, combat: false }]);
      },
    },
  }],
  rulings: {},
});
