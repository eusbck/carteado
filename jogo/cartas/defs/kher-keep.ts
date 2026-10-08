// Kher Keep — Legendary Land
// {T}: Add {C}.
// {1}{R}, {T}: Create a 0/1 red Kobold creature token named Kobolds of Kher Keep.
import { activated, createTokens, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Kher Keep',
  faces: [{
    abilities: [
      mana('C'),
      activated('{1}{R}, {T}', function* (c) {
        yield* createTokens(c.g, c.you, 'Kobolds of Kher Keep', 1);
      }, { text: '{1}{R}, {T}: Crie uma ficha de criatura Kobold vermelha 0/1 chamada Kobolds of Kher Keep.' }),
    ],
  }],
  rulings: {},
});
