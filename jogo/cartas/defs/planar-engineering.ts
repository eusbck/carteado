// Planar Engineering
// Sacrifice two lands. Search your library for four basic land cards, put them onto the battlefield tapped, then shuffle.
import { defineCard, fetchBasicToBattlefield } from '../../motor/api.ts';
import { sacrificaTerrenos } from '../terras.ts';

export default defineCard({
  name: 'Planar Engineering',
  faces: [{
    spell: {
      *effect(c) {
        yield* sacrificaTerrenos(c, c.you, 2);
        yield* fetchBasicToBattlefield(c, 4, { tapped: true, prompt: 'Procure quatro cartas de terreno básico' });
      },
    },
  }],
  rulings: {},
});
