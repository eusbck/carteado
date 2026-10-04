// Bedevil
// Destroy target artifact, creature, or planeswalker.
import { defineCard, destroy, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Bedevil',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.artifact, is.creature, is.planeswalker), 'artefato, criatura ou planeswalker alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
    },
  }],
  rulings: {},
});
