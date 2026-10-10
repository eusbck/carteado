// Launch Mishap
// Counter target creature or planeswalker spell. Create a 1/1 colorless Thopter artifact creature token with flying.
import { counter, createTokens, defineCard, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Launch Mishap",
  faces: [{ spell: { targets: [t.spell(or(is.creature, is.planeswalker), 'mágica de criatura ou planeswalker alvo')], effect: function*(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); yield* createTokens(c.g, c.you, 'Thopter', 1); } } }],
  rulings: {},
});
