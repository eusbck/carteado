// Hedge Maze
// ({T}: Add {G} or {U}.)
// This land enters tapped.
// When this land enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)
import { defineCard, etb, land, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Hedge Maze',
  // a mana vem dos tipos Forest e Island (CR 305.6)
  faces: [{ abilities: [
    land.tapped(),
    // CR 701.25a: vigiar 1
    etb(function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'surveil'); }, { text: 'Quando este terreno entra, vigiar 1.' }),
  ] }],
  rulings: {},
});
