// Palladium Myr
// {T}: Add {C}{C}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Palladium Myr",
  faces: [{ abilities: [mana('CC')] }],
  rulings: {},
});
