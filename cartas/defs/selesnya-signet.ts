// Selesnya Signet
// {1}, {T}: Add {G}{W}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Selesnya Signet',
  faces: [{ abilities: [mana('GW', { cost: '{1}, {T}', text: '{1}, {T}: Adicione {G}{W}.' })] }],
  rulings: {},
});
