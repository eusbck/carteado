// Mutilate
// All creatures get -1/-1 until end of turn for each Swamp you control.
import { allCreatures, controlledBy, defineCard, isSubtype, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Mutilate',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: Swamps contados uma vez na resolução (CR 608.2h) e só as criaturas do campo agora (CR 611.2c)
        const n = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Swamp')).length;
        if (n > 0) untilEndOfTurn(c, allCreatures(c.g), [{ k: 'pt', p: -n, t: -n }]);
      },
    },
  }],
  rulings: {
    1: 'teste: o número de Swamps e as criaturas afetadas ficam fixos na resolução',
  },
});
