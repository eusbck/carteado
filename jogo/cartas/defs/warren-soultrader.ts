// Warren Soultrader
// Pay 1 life, Sacrifice another creature: Create a Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add
// one mana of any color.")
import { activated, createTokens, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Warren Soultrader',
  faces: [{
    abilities: [
      activated('Pay 1 life, Sacrifice another creature', function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Pague 1 de vida, Sacrifique outra criatura: Crie uma ficha Treasure.' }),
    ],
  }],
  rulings: {},
});
