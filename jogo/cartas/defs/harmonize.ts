// Harmonize
// Draw three cards.
import { defineCard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Harmonize',
  faces: [{ spell: { *effect(c) { yield* draw(c.g, c.you, 3); } } }],
  rulings: {},
});
