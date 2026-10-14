// Myrsmith
// Whenever you cast an artifact spell, you may pay {1}. If you do, create a 1/1 colorless Myr artifact creature token.
import { createTokens, defineCard, is, mayPay, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Myrsmith',
  faces: [{
    abilities: [
      // ruling 1: resolve antes da mágica; ruling 2: paga {1} uma vez só, uma ficha só
      triggered(on.youCast(is.artifact), function* (c) {
        if (yield* mayPay(c, c.you, '{1}', 'criar uma ficha Myr')) yield* createTokens(c.g, c.you, 'Myr', 1);
      }, { text: 'Sempre que você conjura uma mágica de artefato, você pode pagar {1}. Se fizer isso, crie uma ficha de criatura artefato Myr incolor 1/1.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjurando um artefato, paga {1} e cria uma ficha Myr antes de a mágica resolver',
    2: 'teste: conjurando um artefato, paga {1} e cria uma ficha Myr antes de a mágica resolver',
  },
});
