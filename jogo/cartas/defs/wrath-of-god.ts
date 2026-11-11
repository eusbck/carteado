// Wrath of God
// Destroy all creatures. They can't be regenerated.
import { allCreatures, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: 'Wrath of God',
  // CR 701.19c: "não podem ser regeneradas"
  faces: [{ spell: { *effect(c) { yield* destroy(c.g, allCreatures(c.g), { cantRegenerate: true }); } } }],
  rulings: {},
});
