// Raffine's Tower
// ({T}: Add {W, {U}, or {B}}.)
// This land enters tapped.
// Cycling {3} ({3}, Discard this card: Draw a card.)
import { cycling, defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Raffine's Tower",
  // a mana vem dos tipos Plains Island Swamp (CR 305.6)
  faces: [{ abilities: [
    land.tapped(),
    cycling('{3}'),
  ] }],
  rulings: {},
});
