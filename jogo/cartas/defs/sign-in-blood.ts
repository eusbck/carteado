// Sign in Blood
// Target player draws two cards and loses 2 life.
import { defineCard, draw, loseLife, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Sign in Blood',
  faces: [{
    spell: {
      targets: [t.player()],
      *effect(c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        yield* draw(c.g, p, 2);
        loseLife(c.g, p, 2, c.source);
      },
    },
  }],
  rulings: {},
});
