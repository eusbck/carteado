// Anguished Unmaking
// Exile target nonland permanent. You lose 3 life.
import { defineCard, exile, loseLife, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Anguished Unmaking',
  faces: [{
    spell: {
      targets: [t.nonlandPermanent()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* exile(c.g, [id]);
        loseLife(c.g, c.you, 3, c.source);
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 608.2b — com o alvo ilegal a mágica não resolve e você não perde vida (testes/cenarios Q21)' },
});
