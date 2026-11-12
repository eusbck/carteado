// Corrupted Conviction
// As an additional cost to cast this spell, sacrifice a creature.
// Draw two cards.
import { defineCard, draw } from '../../motor/api.ts';
import { sacrificaCriatura } from '../cedh.ts';

export default defineCard({
  name: 'Corrupted Conviction',
  faces: [{
    // rulings 1-2: exatamente uma criatura, paga como custo (CR 118.8, 601.2h)
    additionalCosts: [sacrificaCriatura()],
    spell: { *effect(c) { yield* draw(c.g, c.you, 2); } },
  }],
  rulings: {
    1: 'teste: sem criatura para sacrificar, não pode ser conjurada',
    2: 'teste: a criatura já foi sacrificada quando a mágica está na pilha, e compra duas cartas',
  },
});
