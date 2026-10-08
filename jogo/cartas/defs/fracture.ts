// Fracture
// Destroy target artifact, enchantment, or planeswalker.
import { defineCard, destroy, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Fracture',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.artifact, is.enchantment, is.planeswalker), 'artefato, encantamento ou planeswalker alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
    },
  }],
  rulings: {},
});
