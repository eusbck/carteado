// Ashnod's Altar
// Sacrifice a creature: Add {C}{C}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Ashnod's Altar",
  faces: [{ abilities: [mana('CC', { cost: 'Sacrifice a creature', text: 'Sacrifique uma criatura: Adicione {C}{C}.' })] }],
  rulings: {},
});
