// Fyndhorn Elves
// {T}: Add {G}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Fyndhorn Elves',
  faces: [{ abilities: [mana('G', { text: '{T}: Adicione {G}.' })] }],
  rulings: {},
});
