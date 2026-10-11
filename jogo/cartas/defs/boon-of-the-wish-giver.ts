// Boon of the Wish-Giver
// Draw four cards.
// Cycling {1} ({1}, Discard this card: Draw a card.)
import { cycling, defineCard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Boon of the Wish-Giver',
  faces: [{
    abilities: [cycling('{1}')],
    spell: { *effect(c) { yield* draw(c.g, c.you, 4); } },
  }],
  rulings: {},
});
