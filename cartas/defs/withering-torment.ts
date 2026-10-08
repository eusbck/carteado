// Withering Torment
// Destroy target creature or enchantment. You lose 2 life.
import { defineCard, destroy, is, loseLife, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Withering Torment',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.creature, is.enchantment), 'criatura ou encantamento alvo')],
      *effect(c) {
        // ruling 1: com o alvo ilegal a mágica não resolve (CR 608.2b) e você não perde vida
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
        loseLife(c.g, c.you, 2, c.source);
      },
    },
  }],
  rulings: { 1: 'teste: CR 608.2b: alvo ilegal na resolução, não resolve e você não perde vida' },
});
