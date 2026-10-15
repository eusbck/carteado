// Serum Visions
// Draw a card. Scry 2.
import { defineCard, draw, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Serum Visions',
  faces: [{
    spell: {
      *effect(c) {
        // primeiro a compra, depois a vidência 2 (CR 701.22)
        yield* draw(c.g, c.you, 1);
        yield* lookAndArrange(c.g, c.you, 2, 'scry');
      },
    },
  }],
  rulings: {},
});
