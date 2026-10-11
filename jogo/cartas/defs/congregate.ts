// Congregate
// Target player gains 2 life for each creature on the battlefield.
import { allCreatures, defineCard, gainLife, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Congregate',
  faces: [{
    spell: {
      targets: [t.player()],
      *effect(c) {
        const p = tgtPlayer(c);
        // ruling 1 / CR 608.2h: conta as criaturas na resolução
        if (p !== null) gainLife(c.g, p, 2 * allCreatures(c.g).length, c.source);
      },
    },
  }],
  rulings: {
    1: 'teste: CR 608.2h: conta as criaturas na resolução',
  },
});
