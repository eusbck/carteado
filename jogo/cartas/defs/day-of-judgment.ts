// Day of Judgment
// Destroy all creatures.
import { allCreatures, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: 'Day of Judgment',
  faces: [{ spell: { *effect(c) { yield* destroy(c.g, allCreatures(c.g)); } } }],
  rulings: {},
});
