// Magmatic Insight
// As an additional cost to cast this spell, discard a land card.
// Draw two cards.
import { additionalCost, defineCard, draw, isLand } from '../../motor/api.ts';

export default defineCard({
  name: 'Magmatic Insight',
  faces: [{
    // ruling 1: exatamente uma carta de terreno, obrigatório (CR 118.8)
    additionalCosts: [additionalCost('descarte', 'descartar uma carta de terreno', [{ k: 'discard', n: 1, filter: (c, id) => isLand(c.g, id), label: 'uma carta de terreno' }])],
    spell: { *effect(c) { yield* draw(c.g, c.you, 2); } },
  }],
  rulings: { 1: 'teste: sem carta de terreno na mão, não pode ser conjurada' },
});
