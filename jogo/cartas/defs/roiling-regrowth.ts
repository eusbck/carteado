// Roiling Regrowth
// Sacrifice a land. Search your library for up to two basic land cards, put them onto the battlefield tapped, then
// shuffle.
import { defineCard, fetchBasicToBattlefield } from '../../motor/api.ts';
import { sacrificaTerrenos } from '../terras.ts';

export default defineCard({
  name: 'Roiling Regrowth',
  faces: [{
    spell: {
      *effect(c) {
        // a busca não depende do sacrifício (sem terreno, ainda procura)
        yield* sacrificaTerrenos(c, c.you, 1);
        yield* fetchBasicToBattlefield(c, 2, { tapped: true, prompt: 'Procure até duas cartas de terreno básico' });
      },
    },
  }],
  rulings: {},
});
