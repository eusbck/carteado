// Inspiring Overseer
// Flying
// When this creature enters, you gain 1 life and draw a card.
import { defineCard, draw, etb, gainLife, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Inspiring Overseer',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        gainLife(c.g, c.you, 1, c.source);
        yield* draw(c.g, c.you, 1);
      }, { text: 'Quando esta criatura entra, você ganha 1 de vida e compra uma carta.' }),
    ],
  }],
  rulings: {},
});
