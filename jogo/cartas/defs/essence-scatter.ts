// Essence Scatter
// Counter target creature spell.
import { counter, defineCard, is, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Essence Scatter',
  faces: [{ spell: {
    targets: [t.spell(is.creature, 'mágica de criatura alvo')],
    *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
  } }],
  rulings: { 1: 'teste: também anula uma mágica de criatura artefato' },
});
