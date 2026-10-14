// Llanowar Tribe
// {T}: Add {G}{G}{G}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Llanowar Tribe',
  faces: [{ abilities: [mana('GGG', { text: '{T}: Adicione {G}{G}{G}.' })] }],
  rulings: {},
});
