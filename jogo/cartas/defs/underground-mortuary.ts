// Underground Mortuary
// ({T}: Add {B} or {G}.)
// This land enters tapped.
// When this land enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)
import { defineCard, etb, land, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Underground Mortuary',
  // a mana vem dos tipos Swamp Forest (CR 305.6)
  faces: [{
    abilities: [
      land.tapped(),
      etb(function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'surveil'); }, { text: 'Quando este terreno entra, vigiar 1.' }),
    ],
  }],
  rulings: {},
});
