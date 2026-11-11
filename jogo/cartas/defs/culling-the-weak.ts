// Culling the Weak
// As an additional cost to cast this spell, sacrifice a creature.
// Add {B}{B}{B}{B}.
import { addMana, defineCard } from '../../motor/api.ts';
import { sacrificaCriatura } from '../cedh.ts';

export default defineCard({
  name: 'Culling the Weak',
  faces: [{
    // rulings 1-2: exatamente uma criatura, paga como custo (CR 118.8, 601.2h)
    additionalCosts: [sacrificaCriatura()],
    spell: { *effect(c) { addMana(c.g, c.you, ['B', 'B', 'B', 'B'], { source: c.source }); } },
  }],
  rulings: {
    1: 'teste: sem criatura para sacrificar, não pode ser conjurada',
    2: 'teste: a criatura já foi sacrificada quando a mágica está na pilha',
  },
});
