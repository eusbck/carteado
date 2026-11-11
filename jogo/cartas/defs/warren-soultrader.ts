// Warren Soultrader
// Pay 1 life, Sacrifice another creature: Create a Treasure token.
import { activated, createTokens, defineCard, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Warren Soultrader',
  faces: [{
    abilities: [activated([{ k: 'life', n: 1 }, { k: 'sacrifice', n: 1, filter: (c, id) => id !== c.source && isCreature(c.g, id), label: 'outra criatura' }], function* (c) {
      yield* createTokens(c.g, c.you, 'Treasure', 1);
    }, { text: 'Pague 1 de vida, Sacrifique outra criatura: Crie uma ficha de Treasure.' })],
  }],
  rulings: {},
});
