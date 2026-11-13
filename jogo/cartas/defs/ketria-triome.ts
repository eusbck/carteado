// Ketria Triome
// ({T}: Add {G}, {U}, or {R}.)
// This land enters tapped.
// Cycling {3} ({3}, Discard this card: Draw a card.)
import { cycling, defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: 'Ketria Triome',
  // a mana vem dos tipos Forest Island Mountain (CR 305.6)
  faces: [{ abilities: [
    land.tapped(),
    cycling('{3}'),
  ] }],
  rulings: {},
});
