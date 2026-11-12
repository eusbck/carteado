// Dimir Infiltrator
// This creature can't be blocked.
// Transmute {1}{U}{B} ({1}{U}{B}, Discard this card: Search your library for a card with the same mana value as this
// card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)
import { defineCard, transmute } from '../../motor/api.ts';
import { naoPodeSerBloqueada } from '../ninjas.ts';

export default defineCard({
  name: 'Dimir Infiltrator',
  faces: [{
    abilities: [
      naoPodeSerBloqueada(),
      // CR 702.53a (motor/controle.ts)
      transmute('{1}{U}{B}'),
    ],
  }],
  rulings: {},
});
