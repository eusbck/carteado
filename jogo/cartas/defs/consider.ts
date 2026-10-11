// Consider
// Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)
// Draw a card.
import { defineCard, draw, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Consider',
  faces: [{
    spell: {
      // ruling 1: na ordem escrita — primeiro vigiar 1 (CR 701.25a), depois comprar
      *effect(c) {
        yield* lookAndArrange(c.g, c.you, 1, 'surveil');
        yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: {
    1: 'teste: vigia 1 e depois compra uma carta',
  },
});
