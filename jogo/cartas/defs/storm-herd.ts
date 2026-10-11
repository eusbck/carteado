// Storm Herd
// Create X 1/1 white Pegasus creature tokens with flying, where X is your life total.
import { createTokens, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Storm Herd',
  faces: [{
    spell: {
      *effect(c) {
        const x = c.g.state.players[c.you].life;
        if (x > 0) yield* createTokens(c.g, c.you, 'Pegasus 1/1', x);
      },
    },
  }],
  rulings: {},
});