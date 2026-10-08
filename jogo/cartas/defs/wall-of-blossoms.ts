// Wall of Blossoms
// Defender
// When this creature enters, draw a card.
// Teste em carven-caryatid.test.ts (mesmo texto).
import { defineCard, draw, etb, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Wall of Blossoms',
  faces: [{
    abilities: [
      keyword('defender'),
      etb(function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando esta criatura entra, compre uma carta.' }),
    ],
  }],
  rulings: {},
});
