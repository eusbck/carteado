// Undercity Sewers
// ({T}: Add {U} or {B}.)
// This land enters tapped.
// When this land enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)
import { defineCard, etb, land, lookAndArrange, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Undercity Sewers',
  faces: [{
    abilities: [
      mana(['U', 'B']),
      land.tapped(),
      etb(function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'surveil'); }, { text: 'Quando este terreno entra, vigiar 1.' }),
    ],
  }],
  rulings: {},
});
