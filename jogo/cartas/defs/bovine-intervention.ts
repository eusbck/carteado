// Bovine Intervention
// Destroy target artifact or creature. Its controller creates a 2/2 white Ox creature token.
import { controllerOf, createTokens, defineCard, destroy, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Bovine Intervention',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.artifact, is.creature), 'artefato ou criatura alvo')],
      *effect(c) {
        // ruling 1: com o alvo ilegal, nada acontece; com o alvo legal mas não destruído, o controlador cria o Ox mesmo assim
        const id = tgt(c);
        if (id === null) return;
        const quem = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        yield* createTokens(c.g, quem, 'Ox', 1);
      },
    },
  }],
  rulings: {
    1: 'teste: o controlador cria o Ox mesmo que o alvo seja indestrutível; com o alvo ilegal, ninguém cria',
  },
});
