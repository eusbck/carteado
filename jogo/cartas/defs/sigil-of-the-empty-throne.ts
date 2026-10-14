// Sigil of the Empty Throne
// Whenever you cast an enchantment spell, create a 4/4 white Angel creature token with flying.
import { createTokens, defineCard, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Sigil of the Empty Throne',
  faces: [{
    abilities: [
      triggered(on.youCast(is.enchantment), function* (c) {
        yield* createTokens(c.g, c.you, 'Angel', 1);
      }, { text: 'Sempre que você conjura uma mágica de encantamento, crie uma ficha de criatura Angel 4/4 branca com voar.' }),
    ],
  }],
  rulings: {
    1: 'teste: o Angel é criado antes de a mágica de encantamento resolver',
    2: 'teste: conjurar o próprio Sigil não dispara',
  },
});
