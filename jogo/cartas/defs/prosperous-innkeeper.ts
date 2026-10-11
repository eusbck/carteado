// Prosperous Innkeeper
// When this creature enters, create a Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add one mana of
// any color.")
// Whenever another creature you control enters, you gain 1 life.
import { createTokens, defineCard, etb, gainLife, triggered } from '../../motor/api.ts';
import { entraOutraCriaturaSua } from '../miku.ts';

export default defineCard({
  name: 'Prosperous Innkeeper',
  faces: [{
    abilities: [
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 1); }, { text: 'Quando esta criatura entra, crie uma ficha de Treasure.' }),
      triggered(entraOutraCriaturaSua(), function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Sempre que outra criatura que você controla entra, você ganha 1 de vida.' }),
    ],
  }],
  rulings: {},
});