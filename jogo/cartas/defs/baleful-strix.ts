// Baleful Strix
// Flying, deathtouch
// When this creature enters, draw a card.
import { defineCard, draw, etb, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Baleful Strix',
  faces: [{
    abilities: [
      ...keywords('flying', 'deathtouch'),
      etb(function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando esta criatura entra, compre uma carta.' }),
    ],
  }],
  rulings: {},
});
