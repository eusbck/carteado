// Viscera Seer — Sacrifice a creature: Scry 1.
import { activated, defineCard, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Viscera Seer',
  faces: [{ abilities: [activated('Sacrifice a creature', function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'scry'); }, { text: 'Sacrifique uma criatura: Vidência 1.' })] }],
});
