// Stroke of Midnight
// Destroy target nonland permanent. Its controller creates a 1/1 white Human creature token.
import { controllerOf, createTokens, defineCard, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Stroke of Midnight',
  faces: [{
    spell: {
      targets: [t.nonlandPermanent()],
      *effect(c) {
        // ruling 1: com alvo ilegal a mágica não resolve (CR 608.2b); com indestrutível, a ficha vem mesmo assim
        const id = tgt(c);
        if (id === null) return;
        const dono = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        yield* createTokens(c.g, dono, 'Human', 1);
      },
    },
  }],
  rulings: {
    1: 'teste: alvo indestrutível não é destruído, mas o controlador cria a ficha Human',
  },
});
