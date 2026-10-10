// Pull from Tomorrow
// Draw X cards, then discard a card.
import { defineCard, discard, draw } from '../../motor/api.ts';

export default defineCard({
  name: "Pull from Tomorrow",
  faces: [{ spell: { effect: function*(c) { yield* draw(c.g, c.you, c.x); yield* discard(c.g, c.you, 1); } } }],
  rulings: {},
});
