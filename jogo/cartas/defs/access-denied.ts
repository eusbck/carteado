// Access Denied
// Counter target spell. Create X 1/1 colorless Thopter artifact creature tokens with flying, where X is that spell's
// mana value.
import { counter, createTokens, defineCard, manaValue, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Access Denied',
  faces: [{
    spell: {
      targets: [t.spell()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // o valor de mana da mágica na pilha (com o X escolhido, CR 202.3e), visto antes de anular
        const x = manaValue(c.g, id);
        yield* counter(c.g, id);
        if (x > 0) yield* createTokens(c.g, c.you, 'Thopter', x);
      },
    },
  }],
  rulings: {},
});
