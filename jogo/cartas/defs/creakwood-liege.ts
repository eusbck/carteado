// Creakwood Liege
// Other black creatures you control get +1/+1.
// Other green creatures you control get +1/+1.
// At the beginning of your upkeep, you may create a 1/1 black and green Worm creature token.
import { and, anthem, createTokens, defineCard, is, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Creakwood Liege',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours, is.other, is.color('B')), () => [{ k: 'pt', p: 1, t: 1 }], 'As outras criaturas pretas que você controla recebem +1/+1.'),
      anthem(and(is.creature, is.yours, is.other, is.color('G')), () => [{ k: 'pt', p: 1, t: 1 }], 'As outras criaturas verdes que você controla recebem +1/+1.'),
      triggered(on.upkeep('you'), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Creakwood Liege: criar uma ficha Worm?')) yield* createTokens(c.g, c.you, 'Worm', 1);
      }, { text: 'No início da sua manutenção, você pode criar uma ficha de criatura Worm preta e verde 1/1.' }),
    ],
  }],
  rulings: {
    1: 'teste: o Worm preto e verde recebe +2/+2',
    2: 'teste: o Worm preto e verde recebe +2/+2',
  },
});
