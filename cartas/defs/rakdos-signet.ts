// Rakdos Signet
// {1}, {T}: Add {B}{R}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Rakdos Signet',
  faces: [{ abilities: [mana('BR', { cost: '{1}, {T}', text: '{1}, {T}: Adicione {B}{R}.' })] }],
  rulings: {},
});
