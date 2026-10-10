// Ornithopter of Paradise
// Flying
// {T}: Add one mana of any color.
import { defineCard, keyword, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Ornithopter of Paradise",
  faces: [{ abilities: [keyword('flying'), mana('any')] }],
  rulings: {},
});
