// Ancient Craving
// You draw three cards and you lose 3 life.
import { defineCard, draw, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Ancient Craving',
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
