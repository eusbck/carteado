// Jetmir's Garden
// ({T}: Add {R, {G}, or {W}}.)
// This land enters tapped.
// Cycling {3} ({3}, Discard this card: Draw a card.)
import { cycling, defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Jetmir's Garden",
  // a mana vem dos tipos Mountain Forest Plains (CR 305.6)
  faces: [{ abilities: [
    land.tapped(),
    cycling('{3}'),
  ] }],
  rulings: {},
});
