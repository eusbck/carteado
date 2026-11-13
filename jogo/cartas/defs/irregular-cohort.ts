// Irregular Cohort
// Changeling (This card is every creature type.)
// When this creature enters, create a 2/2 colorless Shapeshifter creature token with changeling.
import { changeling, createTokens, defineCard, etb } from '../../motor/api.ts';

export default defineCard({
  name: 'Irregular Cohort',
  faces: [{
    abilities: [
      changeling(),
      etb(function* (c) {
        yield* createTokens(c.g, c.you, 'Shapeshifter 2/2 incolor', 1);
      }, { text: 'Quando esta criatura entra, crie uma ficha de criatura Metamorfo 2/2 incolor com polimorfo.' }),
    ],
  }],
  rulings: {},
});
