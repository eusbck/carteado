// Invoke the Divine
// Destroy target artifact or enchantment. You gain 4 life.
import { defineCard, destroy, gainLife, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Invoke the Divine',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
        gainLife(c.g, c.you, 4, c.source);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — com o único alvo ilegal, a mágica não resolve e ninguém ganha vida (motor/stack.ts)',
    2: 'regra geral: CR 608.2b — com o único alvo ilegal, a mágica não resolve e ninguém ganha vida (motor/stack.ts)',
  },
});
