// Diabolic Intent
// As an additional cost to cast this spell, sacrifice a creature.
// Search your library for a card, put that card into your hand, then shuffle.
import { defineCard, searchTo } from '../../motor/api.ts';
import { sacrificaCriatura } from '../cedh.ts';

export default defineCard({
  name: 'Diabolic Intent',
  faces: [{
    // rulings 1-4: exatamente uma criatura, paga como custo (CR 118.8, 601.2h)
    additionalCosts: [sacrificaCriatura()],
    spell: {
      *effect(c) {
        // ruling 5: precisa escolher uma carta se houver
        yield* searchTo(c, c.you, () => true, 1, 'hand', { exactly: true, prompt: 'Procure uma carta' });
      },
    },
  }],
  rulings: {
    1: 'teste: sem criatura para sacrificar, não pode ser conjurada',
    2: 'teste: sacrifica a criatura ao conjurar e põe a carta procurada na mão',
    3: 'teste: sem criatura para sacrificar, não pode ser conjurada',
    4: 'teste: sacrifica a criatura ao conjurar e põe a carta procurada na mão',
    5: 'teste: sacrifica a criatura ao conjurar e põe a carta procurada na mão',
  },
});
