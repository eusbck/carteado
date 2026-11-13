// Damning Verdict
// Destroy all creatures with no counters on them.
import { allCreatures, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: 'Damning Verdict',
  faces: [{
    spell: {
      *effect(c) {
        // qualquer tipo de marcador protege (CR 122.1)
        const alvos = allCreatures(c.g).filter((id) => !Object.values(c.g.state.objects[id].counters).some((n) => n > 0));
        if (alvos.length) yield* destroy(c.g, alvos);
      },
    },
  }],
  rulings: {},
});
