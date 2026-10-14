// Opt
// Scry 1. (Look at the top card of your library. You may put that card on the bottom.)
// Draw a card.
import { defineCard, draw, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Opt',
  faces: [{
    spell: {
      *effect(c) {
        // CR 701.22: vidência 1 e só depois a compra
        yield* lookAndArrange(c.g, c.you, 1, 'scry');
        yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: {},
});
