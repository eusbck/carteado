// Big Score
// As an additional cost to cast this spell, discard a card.
// Draw two cards and create two Treasure tokens.
import { additionalCost, createTokens, defineCard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Big Score',
  faces: [{
    additionalCosts: [additionalCost('descarte', 'descartar uma carta', [{ k: 'discard', n: 1 }])],
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 2);
        yield* createTokens(c.g, c.you, 'Treasure', 2);
      },
    },
  }],
  rulings: {},
});
