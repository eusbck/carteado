// Tendrils of Corruption
// Tendrils of Corruption deals X damage to target creature and you gain X life, where X is the number of Swamps you
// control.
import { controlledBy, dealDamage, defineCard, gainLife, isSubtype, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Tendrils of Corruption',
  faces: [{
    spell: {
      targets: [t.creature()],
      // ruling 1: com o alvo ilegal a mágica não resolve (CR 608.2b) e não há ganho de vida
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // X contado na resolução (CR 608.2h)
        const x = controlledBy(c.g, c.you, (s) => isSubtype(c.g, s, 'Swamp')).length;
        if (x > 0) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: x, combat: false }]);
        gainLife(c.g, c.you, x, c.source);
      },
    },
  }],
  rulings: {
    1: 'teste: com o alvo ilegal, não resolve e você não ganha vida',
  },
});
