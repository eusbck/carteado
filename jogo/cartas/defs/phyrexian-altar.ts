// Phyrexian Altar
// Sacrifice a creature: Add one mana of any color.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Phyrexian Altar',
  faces: [{ abilities: [mana('any', { cost: 'Sacrifice a creature', text: 'Sacrifique uma criatura: Adicione uma mana de qualquer cor.' })] }],
  rulings: {},
});
