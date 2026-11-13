// Hobbit Hole
// {T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.
// Halflingcycling {4} ({4}, Discard this card: Search your library for a Halfling card, reveal it, put it into your hand,
// then shuffle.)
import { defineCard, land, typecycling } from '../../motor/api.ts';

export default defineCard({
  name: 'Hobbit Hole',
  faces: [{
    abilities: [
      land.fetchBasic(),
      // ciclagem de tipo (CR 702.29e): um card de Halfling, inclusive com polimorfo (CR 702.73a)
      typecycling('Halfling', '{4}'),
    ],
  }],
  rulings: {},
});
