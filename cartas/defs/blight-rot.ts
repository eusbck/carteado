// Blight Rot
// Put four -1/-1 counters on target creature.
import { addCounters, defineCard, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Blight Rot',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) { const id = tgt(c); if (id !== null) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 4, c.you); },
    },
  }],
  rulings: {},
});
