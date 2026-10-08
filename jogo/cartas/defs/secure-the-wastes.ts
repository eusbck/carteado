// Secure the Wastes
// Create X 1/1 white Warrior creature tokens.
import { createTokens, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Secure the Wastes',
  faces: [{
    spell: {
      *effect(c) { yield* createTokens(c.g, c.you, 'Warrior', c.x); },
    },
  }],
  rulings: {},
});
