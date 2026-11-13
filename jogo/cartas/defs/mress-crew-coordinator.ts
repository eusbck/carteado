// M'Ress, Crew Coordinator
// Landfall — Whenever a land you control enters, create two 1/1 red Officer creature tokens.
import { createTokens, defineCard, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "M'Ress, Crew Coordinator",
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) { yield* createTokens(c.g, c.you, 'Officer', 2); }, {
        text: 'Aterragem — Sempre que um terreno que você controla entra, crie duas fichas de criatura Officer 1/1 vermelhas.',
      }),
    ],
  }],
  rulings: {},
});
