// Overeager Apprentice
// Discard a card, Sacrifice this creature: Add {B}{B}{B}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Overeager Apprentice',
  faces: [{ abilities: [mana('BBB', { cost: 'Discard a card, Sacrifice this creature', text: 'Descarte uma carta, Sacrifique esta criatura: Adicione {B}{B}{B}.' })] }],
  rulings: {},
});
