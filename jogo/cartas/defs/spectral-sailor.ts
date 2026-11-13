// Spectral Sailor
// Flash
// Flying
// {3}{U}: Draw a card.
import { activated, defineCard, draw, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Spectral Sailor',
  faces: [{
    abilities: [
      ...keywords('flash', 'flying'),
      activated('{3}{U}', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{3}{U}: Compre uma carta.' }),
    ],
  }],
  rulings: {},
});
