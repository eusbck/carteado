// Vanquish the Horde
// This spell costs {1} less to cast for each creature on the battlefield.
// Destroy all creatures.
import { allCreatures, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: 'Vanquish the Horde',
  faces: [{
    // CR 601.2f: a redução tira só a parte genérica do custo total
    selfCost: (c) => ({ reduce: allCreatures(c.g).length }),
    spell: { *effect(c) { yield* destroy(c.g, allCreatures(c.g)); } },
  }],
  rulings: {},
});
