// Avacyn's Pilgrim
// {T}: Add {W}.
// (mesmo texto de Elvish Mystic)
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Avacyn's Pilgrim",
  faces: [{ abilities: [mana('W', { text: '{T}: Adicione {W}.' })] }],
  rulings: {},
});
