// Dark Ritual
// Add {B}{B}{B}.
import { addMana, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Dark Ritual',
  faces: [{ spell: { *effect(c) { addMana(c.g, c.you, ['B', 'B', 'B'], { source: c.source }); } } }],
  rulings: {},
});
