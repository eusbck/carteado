// Motociata (carta própria da mesa)
// Create X 1/1 green and white Human Citizen creature tokens with haste named Patriota. You gain 1 life for each
// creature you control.
import { createTokens, creaturesOf, defineCard, gainLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Motociata',
  faces: [{
    spell: {
      *effect(c) {
        if (c.x > 0) yield* createTokens(c.g, c.you, 'Patriota', c.x);
        const n = creaturesOf(c.g, c.you).length;
        if (n > 0) gainLife(c.g, c.you, n, c.source);
      },
    },
  }],
  rulings: {},
});
