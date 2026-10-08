// Consuming Corruption
// Consuming Corruption deals X damage to target creature or planeswalker and you gain X life, where X is the number
// of Swamps you control.
import { controlledBy, dealDamage, defineCard, gainLife, isSubtype, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Consuming Corruption',
  faces: [{
    spell: {
      targets: [t.creatureOrPlaneswalker()],
      *effect(c) {
        // ruling 2: alvo ilegal na resolução = não resolve, sem ganhar vida (CR 608.2b)
        const id = tgt(c);
        if (id === null) return;
        // ruling 1: X é contado uma vez, na resolução (CR 608.2h)
        const x = controlledBy(c.g, c.you, (s) => isSubtype(c.g, s, 'Swamp')).length;
        dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: x, combat: false }]);
        gainLife(c.g, c.you, x, c.source);
      },
    },
  }],
  rulings: {
    1: 'teste: X = Swamps que você controla na resolução',
    2: 'teste: CR 608.2b: alvo ilegal na resolução, não resolve e você não ganha vida',
  },
});
