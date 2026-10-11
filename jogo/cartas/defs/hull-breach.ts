// Hull Breach
// Choose one —
// • Destroy target artifact.
// • Destroy target enchantment.
// • Destroy target artifact and target enchantment.
import { defineCard, destroy, modal, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Hull Breach',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        { text: 'Destrua o artefato alvo', targets: [t.artifact()], *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); } },
        { text: 'Destrua o encantamento alvo', targets: [t.enchantment()], *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); } },
        {
          text: 'Destrua o artefato alvo e o encantamento alvo',
          targets: [t.artifact(), t.enchantment()],
          *effect(c) {
            // CR 608.2b: o alvo que continua legal é destruído mesmo que o outro tenha ficado ilegal
            const ids = [tgt(c, 0), tgt(c, 1)].filter((x): x is number => x !== null);
            if (ids.length) yield* destroy(c.g, ids);
          },
        },
      ]),
    },
  }],
  rulings: {},
});
