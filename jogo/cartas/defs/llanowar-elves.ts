// Llanowar Elves
// {T}: Add {G}.
// (mesmo texto de Elvish Mystic)
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Llanowar Elves",
  faces: [{ abilities: [mana('G', { text: '{T}: Adicione {G}.' })] }],
  rulings: {},
});
