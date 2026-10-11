// Worn Powerstone
// This artifact enters tapped.
// {T}: Add {C}{C}.
import { defineCard, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Worn Powerstone',
  faces: [{ abilities: [entersTapped(), mana('CC')] }],
  rulings: {},
});
