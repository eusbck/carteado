// Glimpse the Unthinkable
// Target player mills ten cards.
import { defineCard, mill, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Glimpse the Unthinkable',
  faces: [{
    spell: {
      targets: [t.player()],
      *effect(c) {
        const p = tgtPlayer(c);
        if (p !== null) yield* mill(c.g, p, 10);
      },
    },
  }],
  rulings: {},
});
