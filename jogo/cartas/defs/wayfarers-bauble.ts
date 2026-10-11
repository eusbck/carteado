// Wayfarer's Bauble
// {2}, {T}, Sacrifice this artifact: Search your library for a basic land card, put that card onto the battlefield
// tapped, then shuffle.
import { activated, defineCard, fetchBasicToBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: "Wayfarer's Bauble",
  faces: [{
    abilities: [
      activated('{2}, {T}, Sacrifice this artifact', function* (c) {
        yield* fetchBasicToBattlefield(c, 1, { tapped: true, prompt: 'Procure uma carta de terreno básico' });
      }, { text: '{2}, {T}, Sacrifique este artefato: Procure uma carta de terreno básico, coloque-a no campo virada e embaralhe.' }),
    ],
  }],
  rulings: {},
});
