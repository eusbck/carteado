// Rapid Hybridization
// Destroy target creature. It can't be regenerated. That creature's controller creates a 3/3 green Frog Lizard creature
// token.
import { controllerOf, createTokens, defineCard, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Rapid Hybridization',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        // ruling 2: com o alvo ilegal, nada acontece; ruling 1: a ficha vem mesmo que a criatura não seja destruída
        const id = tgt(c);
        if (id === null) return;
        const quem = controllerOf(c.g, id);
        yield* destroy(c.g, [id], { cantRegenerate: true });
        yield* createTokens(c.g, quem, 'Frog Lizard', 1);
      },
    },
  }],
  rulings: {
    1: 'teste: o controlador cria o Frog Lizard mesmo que a criatura seja indestrutível',
    2: 'regra geral: CR 608.2b — com o alvo ilegal a mágica não resolve e ninguém cria a ficha',
  },
});
