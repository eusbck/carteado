// Silver Myr
// {T}: Add {U}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Silver Myr",
  faces: [{ abilities: [mana('U')] }],
  rulings: {},
});
