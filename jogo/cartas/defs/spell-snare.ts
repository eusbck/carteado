// Spell Snare
// Counter target spell with mana value 2.
import { counter, defineCard, manaValue, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Spell Snare',
  faces: [{ spell: {
    targets: [t.spell((c, id) => manaValue(c.g, id) === 2, 'mágica alvo com valor de mana 2')],
    *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
  } }],
  rulings: {},
});
