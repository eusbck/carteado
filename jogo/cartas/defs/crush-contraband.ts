// Crush Contraband
// Choose one or both —
// • Exile target artifact.
// • Exile target enchantment.
import { defineCard, exile, modal, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Crush Contraband',
  faces: [{
    spell: {
      modes: modal(1, 2, [
        { text: 'Exile o artefato alvo', targets: [t.artifact()], *effect(c) { const id = tgt(c); if (id !== null) yield* exile(c.g, [id]); } },
        { text: 'Exile o encantamento alvo', targets: [t.enchantment()], *effect(c) { const id = tgt(c); if (id !== null) yield* exile(c.g, [id]); } },
      ]),
    },
  }],
  rulings: {
    1: 'teste: com os dois modos, se um alvo ficar ilegal, o outro ainda é exilado',
  },
});
