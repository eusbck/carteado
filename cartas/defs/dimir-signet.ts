// Dimir Signet
// {1}, {T}: Add {U}{B}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Dimir Signet',
  faces: [{ abilities: [mana('UB', { cost: '{1}, {T}', text: '{1}, {T}: Adicione {U}{B}.' })] }],
  rulings: {},
});
