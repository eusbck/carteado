// Ambition's Cost
// You draw three cards and lose 3 life.
import { defineCard, draw, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: "Ambition's Cost",
  faces: [{
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 3);
        loseLife(c.g, c.you, 3, c.source);
      },
    },
  }],
  rulings: {},
});
