// Rampaging Baloths — Trample. Landfall — Whenever a land you control enters, create a 4/4 green Beast creature token.
import { createTokens, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Rampaging Baloths',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(on.landfall(), function* (c) { yield* createTokens(c.g, c.you, 'Beast 4/4', 1); }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, crie uma ficha de criatura Beast verde 4/4.' }),
    ],
  }],
  rulings: {},
});
