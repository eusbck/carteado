// Zagoth Triome
// ({T}: Add {B}, {G}, or {U}.)
// This land enters tapped.
// Cycling {3} ({3}, Discard this card: Draw a card.)
import { cycling, defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: 'Zagoth Triome',
  // a mana vem dos tipos Swamp Forest Island (CR 305.6)
  faces: [{ abilities: [
    land.tapped(),
    cycling('{3}'),
  ] }],
  rulings: {},
});
