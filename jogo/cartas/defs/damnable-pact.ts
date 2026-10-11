// Damnable Pact
// Target player draws X cards and loses X life.
import { defineCard, draw, loseLife, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Damnable Pact',
  faces: [{
    spell: {
      targets: [t.player()],
      *effect(c) {
        const p = tgtPlayer(c);
        if (p === null || c.x <= 0) return;
        yield* draw(c.g, p, c.x);
        loseLife(c.g, p, c.x, c.source);
      },
    },
  }],
  rulings: {},
});
