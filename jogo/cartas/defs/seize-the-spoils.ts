// Seize the Spoils
// As an additional cost to cast this spell, discard a card.
// Draw two cards and create a Treasure token.
import { additionalCost, createTokens, defineCard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Seize the Spoils',
  faces: [{
    // rulings 1-2: exatamente uma carta, obrigatório
    additionalCosts: [additionalCost('discard', 'descartar uma carta', [{ k: 'discard', n: 1 }])],
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 2);
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      },
    },
  }],
  rulings: {
    1: 'teste: sem carta para descartar, não pode ser conjurada',
    2: 'regra geral: CR 601.2f — custo adicional obrigatório de uma carta',
  },
});
