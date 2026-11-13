// Prismatic Vista
// {T}, Pay 1 life, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield, then
// shuffle.
import { activated, defineCard, fetchBasicToBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Prismatic Vista',
  faces: [{
    abilities: [
      // o terreno entra desvirado (o texto não diz "virado")
      activated('{T}, Pay 1 life, Sacrifice this land', function* (c) {
        yield* fetchBasicToBattlefield(c, 1, { tapped: false, prompt: 'Procure uma carta de terreno básico' });
      }, { text: '{T}, Pague 1 ponto de vida, Sacrifique este terreno: Procure no seu grimório uma carta de terreno básico, coloque-a no campo e embaralhe.' }),
    ],
  }],
  rulings: {},
});
