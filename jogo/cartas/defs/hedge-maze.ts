// Hedge Maze — ({T}: Add {G} or {U}.) This land enters tapped. When this land enters, surveil 1.
import { defineCard, etb, land, lookAndArrange, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Hedge Maze',
  faces: [{
    abilities: [
      land.tapped(),
      mana(['G', 'U']),
      etb(function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'surveil'); }, { text: 'Quando este terreno entra, vigie 1.' }),
    ],
  }],
  rulings: {},
});
