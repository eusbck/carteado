// Carven Caryatid
// Defender
// When this creature enters, draw a card.
import { defineCard, draw, etb, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Carven Caryatid',
  faces: [{
    abilities: [
      keyword('defender'),
      etb(function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando esta criatura entra, compre uma carta.' }),
    ],
  }],
  rulings: {},
});
