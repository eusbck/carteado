// Madame Hydra
// Whenever you cast a Villain spell, create a 2/1 black Villain creature token with menace. (It can't be blocked except
// by two or more creatures.)
import { createTokens, defineCard, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Madame Hydra',
  faces: [{
    abilities: [
      triggered(on.youCast(is.subtype('Villain')), function* (c) { yield* createTokens(c.g, c.you, 'Villain', 1); }, {
        text: 'Sempre que você conjura uma mágica de Villain, crie uma ficha de criatura Villain 2/1 preta com ameaçar.',
      }),
    ],
  }],
  rulings: {},
});
