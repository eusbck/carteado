// Mesa Enchantress
// Whenever you cast an enchantment spell, you may draw a card.
import { defineCard, draw, is, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Mesa Enchantress',
  faces: [{
    abilities: [
      triggered(on.youCast(is.enchantment), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Mesa Enchantress: comprar uma carta?')) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você conjura uma mágica de encantamento, você pode comprar uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: a compra resolve antes do encantamento',
    2: 'regra geral: CR 603.2 — o gatilho é independente da mágica: resolve mesmo com ela anulada',
    3: 'teste: encantamento posto no campo sem ser conjurado não dispara',
  },
});
