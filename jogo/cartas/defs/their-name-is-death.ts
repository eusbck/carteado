// Their Name Is Death
// Destroy all nonartifact creatures.
import { allCreatures, defineCard, destroy, isType } from '../../motor/api.ts';

export default defineCard({
  name: 'Their Name Is Death',
  faces: [{
    spell: {
      *effect(c) {
        const ids = allCreatures(c.g).filter((id) => !isType(c.g, id, 'Artifact'));
        if (ids.length) yield* destroy(c.g, ids);
      },
    },
  }],
  rulings: {},
});