// Generous Gift
// Destroy target permanent. Its controller creates a 3/3 green Elephant creature token.
import { controllerOf, createTokens, defineCard, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Generous Gift',
  faces: [{
    spell: {
      targets: [t.permanent()],
      *effect(c) {
        // ruling 1: sem o alvo, a mágica não resolve; com o alvo legal mas indestrutível, o controlador cria a ficha
        const id = tgt(c);
        if (id === null) return;
        const controlador = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        yield* createTokens(c.g, controlador, 'Elephant', 1);
      },
    },
  }],
  rulings: {
    1: 'teste: com a permanente indestrutível, ela fica e o controlador cria a ficha mesmo assim',
  },
});