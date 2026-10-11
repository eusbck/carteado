// Mana Confluence
// {T}, Pay 1 life: Add one mana of any color.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Mana Confluence',
  faces: [{ abilities: [
    // CR 119.4: pagar vida exige ter pelo menos essa vida
    mana('any', { cost: '{T}, Pay 1 life', text: '{T}, Pague 1 de vida: Adicione uma mana de qualquer cor.' }),
  ] }],
  rulings: {},
});
