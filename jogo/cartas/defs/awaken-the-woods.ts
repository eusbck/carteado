// Awaken the Woods — Create X 1/1 green Forest Dryad land creature tokens.
import { createTokens, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Awaken the Woods',
  faces: [{ spell: { *effect(c) { const x = c.x ?? 0; if (x > 0) yield* createTokens(c.g, c.you, 'Forest Dryad', x); } } }],
  rulings: {},
});
