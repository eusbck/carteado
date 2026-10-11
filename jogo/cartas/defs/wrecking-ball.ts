// Wrecking Ball
// Destroy target creature or land.
import { defineCard, destroy, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Wrecking Ball',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.creature, is.land), 'criatura ou terreno alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      },
    },
  }],
  rulings: {},
});