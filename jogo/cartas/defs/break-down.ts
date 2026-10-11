// Break Down
// Destroy target artifact or enchantment. Create a Junk token. (It's an artifact with "{T}, Sacrifice this token: Exile
// the top card of your library. You may play that card this turn. Activate only as a sorcery.")
import { createTokens, defineCard, destroy, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Break Down',
  faces: [{
    spell: {
      // ruling 3: sem o alvo, a mágica não resolve e você não cria a ficha
      targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        yield* destroy(c.g, [id]);
        yield* createTokens(c.g, c.you, 'Junk', 1);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 118.3 — um recurso paga um custo só: a ficha sacrificada não paga outro (motor/costs.ts)',
    2: 'teste: a ficha Junk exila o topo do grimório e deixa jogar essa carta neste turno, pagando os custos',
    3: 'regra geral: CR 608.2b — com o único alvo ilegal, a mágica não resolve e a ficha não é criada (motor/stack.ts)',
  },
});