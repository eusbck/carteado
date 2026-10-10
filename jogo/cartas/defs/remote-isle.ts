// Remote Isle
// This land enters tapped.
// {T}: Add {U}.
// Cycling {2} ({2}, Discard this card: Draw a card.)
import { cycling, defineCard, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Remote Isle",
  faces: [{ abilities: [entersTapped(), mana('U'), cycling('{2}')] }],
  rulings: {},
});
