// Nested Shambler
// When this creature dies, create X tapped 1/1 green Squirrel creature tokens, where X is this creature's power.
import { createTokens, defineCard, lkiChars, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Nested Shambler',
  faces: [{
    abilities: [
      triggered(on.selfDies(), function* (c) {
        // ruling 1: a força da última vez no campo; 0 ou menos não cria nada
        const x = lkiChars(c.g, c.source)?.power ?? 0;
        if (x > 0) yield* createTokens(c.g, c.you, 'Squirrel', x, { tapped: true });
      }, { text: 'Quando esta criatura morre, crie X fichas de criatura Squirrel verdes 1/1 viradas, em que X é a força desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: morre com força 3 (dois marcadores): cria três Squirrels virados',
  },
});
