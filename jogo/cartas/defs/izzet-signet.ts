// Izzet Signet
// {1}, {T}: Add {U}{R}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Izzet Signet',
  faces: [{ abilities: [mana('UR', { cost: '{1}, {T}', text: '{1}, {T}: Adicione {U}{R}.' })] }],
  rulings: {},
});
