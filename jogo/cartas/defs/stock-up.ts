// Stock Up
// Look at the top five cards of your library. Put two of them into your hand and the rest on the bottom of your library in any order.
import { defineCard } from '../../motor/api.ts';
import { olhaTopoParaMao } from '../dimir.ts';

export default defineCard({
  name: 'Stock Up',
  faces: [{ spell: { *effect(c) { yield* olhaTopoParaMao(c, 5, 2, 'ordered', 'Stock Up'); } } }],
  rulings: {},
});
