// Roiling Regrowth
// Sacrifice a land. Search your library for up to two basic land cards, put them onto the battlefield tapped, then
// shuffle.
import { defineCard, isLand, sacrificeYours } from '../../motor/api.ts';
import { basico, buscaTerrenos } from '../terras.ts';

export default defineCard({
  name: 'Roiling Regrowth',
  faces: [{
    spell: {
      *effect(c) {
        yield* sacrificeYours(c, c.you, (id) => isLand(c.g, id), 1, 'um terreno');
        yield* buscaTerrenos(c, 2, (id) => basico(c.g, id), true, 'Procure até duas cartas de terreno básico');
      },
    },
  }],
  rulings: {},
});
