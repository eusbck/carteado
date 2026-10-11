// Languish
// All creatures get -4/-4 until end of turn.
import { allCreatures, defineCard, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Languish',
  faces: [{
    spell: {
      *effect(c) {
        // só as criaturas que estão no campo na resolução (CR 611.2c)
        const ids = allCreatures(c.g);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: -4, t: -4 }]);
      },
    },
  }],
  rulings: {},
});
