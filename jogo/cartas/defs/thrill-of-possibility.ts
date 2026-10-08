// Thrill of Possibility
// As an additional cost to cast this spell, discard a card.
// Draw two cards.
import { additionalCost, defineCard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Thrill of Possibility',
  faces: [{
    // ruling 1: exatamente uma carta, obrigatório
    additionalCosts: [additionalCost('discard', 'descartar uma carta', [{ k: 'discard', n: 1 }])],
    spell: { *effect(c) { yield* draw(c.g, c.you, 2); } },
  }],
  rulings: { 1: 'teste: sem carta para descartar, não pode ser conjurada' },
});
