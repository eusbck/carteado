// Preordain
// Scry 2, then draw a card. (To scry 2, look at the top two cards of your library, then put any number of them on the
// bottom and the rest on top in any order.)
import { defineCard, draw, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Preordain',
  faces: [{
    spell: {
      *effect(c) {
        // CR 701.22: vidência 2 e só depois a compra
        yield* lookAndArrange(c.g, c.you, 2, 'scry');
        yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: {},
});
