// Rapacious Dragon
// Flying
// When this creature enters, create two Treasure tokens.
import { createTokens, defineCard, etb, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Rapacious Dragon',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 2); }, { text: 'Quando esta criatura entra, crie duas fichas de Tesouro.' }),
    ],
  }],
  rulings: {},
});
