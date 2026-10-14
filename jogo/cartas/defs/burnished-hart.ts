// Burnished Hart
// {3}, Sacrifice this creature: Search your library for up to two basic land cards, put them onto the battlefield
// tapped, then shuffle.
import { activated, defineCard, fetchBasicToBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Burnished Hart',
  faces: [{
    abilities: [
      activated('{3}, Sacrifice this creature', function* (c) {
        yield* fetchBasicToBattlefield(c, 2, { tapped: true, prompt: 'Procure até duas cartas de terreno básico' });
      }, { text: '{3}, Sacrifique esta criatura: Procure até duas cartas de terreno básico, coloque-as no campo viradas e depois embaralhe.' }),
    ],
  }],
  rulings: {},
});
