// Dark Ritual
// Add {B}{B}{B}.
import { addMana, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Dark Ritual',
  faces: [{
    // CR 106.4: a mana vai para a reserva e se esvazia no fim da etapa
    spell: { *effect(c) { addMana(c.g, c.you, ['B', 'B', 'B'], { source: c.source }); } },
  }],
  rulings: {},
});
