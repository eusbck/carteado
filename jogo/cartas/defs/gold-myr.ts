// Gold Myr
// {T}: Add {W}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Gold Myr',
  faces: [{ abilities: [mana('W', { text: '{T}: Adicione {W}.' })] }],
  rulings: {},
});
