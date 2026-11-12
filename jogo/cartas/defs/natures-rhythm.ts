// Nature's Rhythm
// Search your library for a creature card with mana value X or less, put it onto the battlefield, then shuffle.
// Harmonize {X}{G}{G}{G}{G} (You may cast this card from your graveyard for its harmonize cost. You may tap a creature
// you control to reduce that cost by an amount of generic mana equal to its power. Then exile this spell.)
import { defineCard, harmonize, isCreature, manaValue, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: "Nature's Rhythm",
  faces: [{
    altCosts: [harmonize('{X}{G}{G}{G}{G}')],
    spell: {
      *effect(c) {
        const x = c.x ?? 0;
        yield* searchTo(c, c.you, (id) => isCreature(c.g, id) && manaValue(c.g, id) <= x, 1, 'battlefield', { prompt: `Nature's Rhythm: procure uma carta de criatura com valor de mana ${x} ou menos` });
      },
    },
  }],
  rulings: {},
});
