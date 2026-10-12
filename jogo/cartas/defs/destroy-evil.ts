// Destroy Evil
// Choose one —
// • Destroy target creature with toughness 4 or greater.
// • Destroy target enchantment.
import { defineCard, destroy, modal, t, tgt, toughness } from '../../motor/api.ts';

export default defineCard({
  name: 'Destroy Evil',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Destrua a criatura alvo com resistência 4 ou mais', targets: [t.creature((c, id) => toughness(c.g, id) >= 4, 'criatura alvo com resistência 4 ou mais')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
        {
          text: 'Destrua o encantamento alvo', targets: [t.enchantment()],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
      ]),
    },
  }],
  rulings: {},
});