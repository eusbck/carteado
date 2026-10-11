// Spirited Companion
// When this creature enters, draw a card.
import { defineCard, draw, etb } from '../../motor/api.ts';

export default defineCard({
  name: 'Spirited Companion',
  faces: [{
    abilities: [etb(function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando esta criatura entra, compre uma carta.' })],
  }],
  rulings: {},
});
