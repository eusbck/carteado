// Sakura-Tribe Elder
// Sacrifice this creature: Search your library for a basic land card, put that card onto the battlefield tapped, then
// shuffle.
import { activated, defineCard, fetchBasicToBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Sakura-Tribe Elder',
  faces: [{
    abilities: [activated('Sacrifice this creature', function* (c) { yield* fetchBasicToBattlefield(c, 1, { tapped: true, prompt: 'Procure uma carta de terreno básico' }); }, {
      text: 'Sacrifique esta criatura: Procure uma carta de terreno básico, coloque-a no campo virada, depois embaralhe.',
    })],
  }],
  rulings: {},
});
