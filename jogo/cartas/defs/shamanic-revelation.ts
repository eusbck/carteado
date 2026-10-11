// Shamanic Revelation
// Draw a card for each creature you control.
// Ferocious — You gain 4 life for each creature you control with power 4 or greater.
import { creaturesOf, defineCard, draw, gainLife, power } from '../../motor/api.ts';

export default defineCard({
  name: 'Shamanic Revelation',
  faces: [{
    spell: {
      *effect(c) {
        const n = creaturesOf(c.g, c.you).length;
        if (n) yield* draw(c.g, c.you, n);
        // ruling 1: nada acontece entre comprar e ganhar vida
        const fortes = creaturesOf(c.g, c.you).filter((id) => power(c.g, id) >= 4).length;
        if (fortes) gainLife(c.g, c.you, 4 * fortes, c.source);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2 — a mágica resolve inteira antes de qualquer gatilho ir para a pilha (motor/stack.ts resolveTop)',
  },
});