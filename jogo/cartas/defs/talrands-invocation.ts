// Talrand's Invocation
// Create two 2/2 blue Drake creature tokens with flying.
import { createTokens, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: "Talrand's Invocation",
  faces: [{
    spell: {
      *effect(c) { yield* createTokens(c.g, c.you, 'Drake', 2); },
    },
  }],
  rulings: {},
});
