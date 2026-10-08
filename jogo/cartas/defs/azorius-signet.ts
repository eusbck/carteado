// Azorius Signet
// {1}, {T}: Add {W}{U}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Azorius Signet',
  faces: [{ abilities: [mana('WU', { cost: '{1}, {T}', text: '{1}, {T}: Adicione {W}{U}.' })] }],
  rulings: {},
});
