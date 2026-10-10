// Lonely Sandbar
// This land enters tapped.
// {T}: Add {U}.
// Cycling {U} ({U}, Discard this card: Draw a card.)
import { cycling, defineCard, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Lonely Sandbar",
  faces: [{ abilities: [entersTapped(), mana('U'), cycling('{U}')] }],
  rulings: {},
});
