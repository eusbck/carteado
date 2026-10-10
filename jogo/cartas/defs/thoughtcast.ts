// Thoughtcast
// Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)
// Draw two cards.
import { defineCard, draw } from '../../motor/api.ts';
import { affinity } from '../artefatos.ts';

export default defineCard({
  name: "Thoughtcast",
  faces: [{ selfCost: affinity, spell: { effect: function*(c) { yield* draw(c.g, c.you, 2); } } }],
  rulings: {},
});
