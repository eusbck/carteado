// Franklin Richards, Ascendant
// At the beginning of combat on your turn, if you've cast a noncreature spell this turn, discover 6. (Exile cards from
// the top of your library until you exile a nonland card with mana value 6 or less. Cast it without paying its mana
// cost or put it into your hand. Put the rest on the bottom in a random order.)
import { defineCard, discover } from '../../motor/api.ts';
import { noCombateSeConjurou } from '../quarteto.ts';

export default defineCard({
  name: 'Franklin Richards, Ascendant',
  faces: [{
    abilities: [
      // CR 701.57
      noCombateSeConjurou(function* (c) { yield* discover(c.g, c.you, 6); }, {
        text: 'No início do combate no seu turno, se você conjurou uma mágica que não é de criatura neste turno, descobrir 6.',
      }),
    ],
  }],
  rulings: {},
});
