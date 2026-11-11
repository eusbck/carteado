// Wooded Ridgeline
// ({T}: Add {R} or {G}.)
// This land enters tapped.
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: 'Wooded Ridgeline',
  // a mana vem dos tipos Mountain e Forest (CR 305.6)
  faces: [{ abilities: [land.tapped()] }],
  rulings: {},
});
