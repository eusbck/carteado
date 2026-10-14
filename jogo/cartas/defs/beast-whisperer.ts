// Beast Whisperer
// Whenever you cast a creature spell, draw a card.
import { defineCard, draw, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Beast Whisperer',
  faces: [{
    abilities: [
      // ruling 1: resolve antes da mágica, mesmo que ela seja anulada
      triggered(on.youCast(is.creature), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que você conjura uma mágica de criatura, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjurar uma mágica de criatura compra uma carta antes de ela resolver; outra mágica, não',
  },
});
