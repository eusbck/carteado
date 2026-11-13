// Phyrexian Tower
// {T}: Add {C}.
// {T}, Sacrifice a creature: Add {B}{B}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Phyrexian Tower',
  faces: [{
    abilities: [
      mana('C'),
      mana('BB', { cost: '{T}, Sacrifice a creature', text: '{T}, Sacrifique uma criatura: Adicione {B}{B}.' }),
    ],
  }],
  rulings: {},
});
