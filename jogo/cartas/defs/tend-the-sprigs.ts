// Tend the Sprigs
// Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. Then if you control
// seven or more lands and/or Treefolk, create a 3/4 green Treefolk creature token with reach.
import { controlledBy, createTokens, defineCard, fetchBasicToBattlefield, isLand, isSubtype } from '../../motor/api.ts';

export default defineCard({
  name: 'Tend the Sprigs',
  faces: [{
    spell: {
      *effect(c) {
        yield* fetchBasicToBattlefield(c, 1, { tapped: true, prompt: 'Procure uma carta de terreno básico' });
        // "terrenos e/ou Treefolk": um permanente que é as duas coisas conta uma vez
        const n = controlledBy(c.g, c.you, (id) => isLand(c.g, id) || isSubtype(c.g, id, 'Treefolk')).length;
        if (n >= 7) yield* createTokens(c.g, c.you, 'Treefolk', 1);
      },
    },
  }],
  rulings: {},
});
