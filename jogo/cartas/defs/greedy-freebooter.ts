// Greedy Freebooter
// When this creature dies, scry 1 and create a Treasure token. (To scry 1, look at the top card of your library.
// You may put that card on the bottom. A Treasure token is an artifact with "{T}, Sacrifice this token:
// Add one mana of any color.")
import { createTokens, defineCard, lookAndArrange, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Greedy Freebooter',
  faces: [{ abilities: [
    triggered(on.selfDies(), function* (c) {
      yield* lookAndArrange(c.g, c.you, 1, 'scry');
      yield* createTokens(c.g, c.you, 'Treasure', 1);
    }, { text: 'Quando esta criatura morre, use vidência 1 e crie uma ficha de Tesouro.' }),
  ] }],
  rulings: {},
});
