// Treasure Cruise
// Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)
// Draw three cards.
import { defineCard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Treasure Cruise',
  faces: [{
    // CR 702.66: delve (motor/stack.ts)
    delve: true,
    spell: { *effect(c) { yield* draw(c.g, c.you, 3); } },
  }],
  rulings: {
    1: 'regra geral: CR 702.66b — delve não é custo alternativo',
    2: 'regra geral: CR 702.66b — o valor de mana continua 8',
    3: 'teste: só paga genérico; não exila mais que o genérico',
  },
});
