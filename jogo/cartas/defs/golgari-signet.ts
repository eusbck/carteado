// Golgari Signet
// {1}, {T}: Add {B}{G}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Golgari Signet',
  faces: [{ abilities: [mana('BG', { cost: '{1}, {T}', text: '{1}, {T}: Adicione {B}{G}.' })] }],
  rulings: {},
});
