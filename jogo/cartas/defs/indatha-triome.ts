// Indatha Triome
// ({T}: Add {W}, {B}, or {G}.)
// This land enters tapped.
// Cycling {3} ({3}, Discard this card: Draw a card.)
import { cycling, defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: 'Indatha Triome',
  // a mana vem dos tipos Plains Swamp Forest (CR 305.6)
  faces: [{ abilities: [
    land.tapped(),
    cycling('{3}'),
  ] }],
  rulings: {},
});
