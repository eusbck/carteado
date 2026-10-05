// Darkness Descends
// Put two -1/-1 counters on each creature.
import { addCounters, allCreatures, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Darkness Descends',
  faces: [{
    spell: {
      *effect(c) { for (const id of allCreatures(c.g)) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 2, c.you); },
    },
  }],
  rulings: {},
});
