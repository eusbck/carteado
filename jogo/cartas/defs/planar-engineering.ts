// Planar Engineering
// Sacrifice two lands. Search your library for four basic land cards, put them onto the battlefield tapped, then shuffle.
import { defineCard, isLand, sacrificeYours } from '../../motor/api.ts';
import { basico, buscaTerrenos } from '../terras.ts';

export default defineCard({
  name: 'Planar Engineering',
  faces: [{
    spell: {
      *effect(c) {
        yield* sacrificeYours(c, c.you, (id) => isLand(c.g, id), 2, 'dois terrenos');
        yield* buscaTerrenos(c, 4, (id) => basico(c.g, id), true, 'Procure quatro cartas de terreno básico');
      },
    },
  }],
  rulings: {},
});
