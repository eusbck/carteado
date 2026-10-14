// Universal Surveillance
// Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities
// pays for {1}.)
// Draw X cards.
import { defineCard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Universal Surveillance',
  faces: [{
    // CR 702.126a
    improvise: true,
    spell: {
      *effect(c) { if (c.x > 0) yield* draw(c.g, c.you, c.x); },
    },
  }],
  rulings: {},
});
