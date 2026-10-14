// Prismatic Lens
// {T}: Add {C}.
// {1}, {T}: Add one mana of any color.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Prismatic Lens',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana('any', { cost: '{1}, {T}', text: '{1}, {T}: Adicione uma mana de qualquer cor.' }),
    ],
  }],
  rulings: {},
});
