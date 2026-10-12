// Wave Goodbye
// Return each creature without a +1/+1 counter on it to its owner's hand.
import { allCreatures, defineCard, moveObjects } from '../../motor/api.ts';

export default defineCard({
  name: 'Wave Goodbye',
  faces: [{
    spell: {
      *effect(c) {
        const ids = allCreatures(c.g).filter((id) => !(c.g.state.objects[id].counters['+1/+1'] > 0));
        if (ids.length) yield* moveObjects(c.g, ids.map((id) => ({ id, to: 'hand' as const })), 'effect');
      },
    },
  }],
  rulings: {},
});