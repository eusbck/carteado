// Organic Extinction
// Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities
// pays for {1}.)
// Destroy all nonartifact creatures.
import { allCreatures, defineCard, destroy, isType } from '../../motor/api.ts';

export default defineCard({
  name: 'Organic Extinction',
  faces: [{
    // CR 702.126a
    improvise: true,
    spell: {
      *effect(c) { yield* destroy(c.g, allCreatures(c.g).filter((id) => !isType(c.g, id, 'Artifact'))); },
    },
  }],
  rulings: {},
});
