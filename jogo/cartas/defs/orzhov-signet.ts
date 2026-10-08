// Orzhov Signet
// {1}, {T}: Add {W}{B}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Orzhov Signet',
  faces: [{ abilities: [mana('WB', { cost: '{1}, {T}', text: '{1}, {T}: Adicione {W}{B}.' })] }],
  rulings: {},
});
