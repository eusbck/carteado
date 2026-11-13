// Prismatic Vista
// {T}, Pay 1 life, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield, then shuffle.
import { activated, defineCard, fetchBasicToBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Prismatic Vista',
  faces: [{
    abilities: [activated('{T}, Pay 1 life, Sacrifice this land', function* (c) {
      yield* fetchBasicToBattlefield(c, 1, { tapped: false, prompt: 'Procure uma carta de terreno básico' });
    }, { text: '{T}, Pague 1 de vida, Sacrifique este terreno: Procure uma carta de terreno básico, coloque-a no campo de batalha e depois embaralhe.' })],
  }],
  rulings: {},
});
