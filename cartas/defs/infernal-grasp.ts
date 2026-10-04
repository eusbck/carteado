// Infernal Grasp — Destroy target creature. You lose 2 life.
import { defineCard, destroy, loseLife, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Infernal Grasp',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
        loseLife(c.g, c.you, 2, c.source);
      },
    },
  }],
});
