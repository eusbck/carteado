// Shared Roots — Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.
import { defineCard, fetchBasicToBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Shared Roots',
  faces: [{ spell: { *effect(c) { yield* fetchBasicToBattlefield(c, 1, { tapped: true, prompt: 'Procure uma carta de terreno básico' }); } } }],
  rulings: {},
});
