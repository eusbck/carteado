// Go for the Throat
// Destroy target nonartifact creature.
import { defineCard, destroy, is, not, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Go for the Throat',
  faces: [{
    spell: {
      // CR 608.2b: se o alvo virou artefato, fica ilegal e a mágica não resolve (rulings 1 e 2)
      targets: [t.creature(not(is.artifact), 'criatura não artefato alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      },
    },
  }],
  rulings: {
    1: 'teste: se o alvo virou artefato, a mágica não resolve',
    2: 'teste: se o alvo virou artefato, a mágica não resolve',
  },
});
