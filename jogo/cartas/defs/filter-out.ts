// Filter Out
// Return all noncreature, nonland permanents to their owners' hands.
import { defineCard, isCreature, isLand, returnToHand } from '../../motor/api.ts';

export default defineCard({
  name: 'Filter Out',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const ids = s.zones.battlefield.filter((id) => !isCreature(c.g, id) && !isLand(c.g, id));
        if (ids.length) yield* returnToHand(c.g, ids);
      },
    },
  }],
  rulings: {},
});
