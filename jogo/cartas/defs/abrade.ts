// Abrade — Choose one — • Abrade deals 3 damage to target creature. • Destroy target artifact.
import { dealDamage, defineCard, destroy, modal, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Abrade',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Causa 3 de dano à criatura alvo', targets: [t.creature()],
          *effect(c) { const id = tgt(c); if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 3, combat: false }]); },
        },
        { text: 'Destrua o artefato alvo', targets: [t.artifact()], *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); } },
      ]),
    },
  }],
});
