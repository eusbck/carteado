// Rip Apart
// Choose one —
// • Rip Apart deals 3 damage to target creature or planeswalker.
// • Destroy target artifact or enchantment.
import { dealDamage, defineCard, destroy, is, modal, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Rip Apart',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Causa 3 de dano à criatura ou planeswalker alvo', targets: [t.creatureOrPlaneswalker()],
          *effect(c) { const id = tgt(c); if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 3, combat: false }]); },
        },
        {
          text: 'Destrua o artefato ou encantamento alvo', targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
      ]),
    },
  }],
  rulings: {},
});
