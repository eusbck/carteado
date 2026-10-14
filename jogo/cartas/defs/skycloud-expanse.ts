// Skycloud Expanse
// {1}, {T}: Add {W}{U}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Skycloud Expanse',
  faces: [{ abilities: [mana('WU', { cost: '{1}, {T}', text: '{1}, {T}: Adicione {W}{U}.' })] }],
  rulings: {},
});
