// Cancel
// Counter target spell.
import { counter, defineCard, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Cancel',
  faces: [{
    spell: {
      targets: [t.spell()],
      *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
    },
  }],
  rulings: {},
});
