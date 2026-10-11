// Soothsaying
// {3}{U}{U}: Shuffle your library.
// {X}: Look at the top X cards of your library, then put them back in any order.
import { activated, defineCard, shuffleLibrary } from '../../motor/api.ts';
import { reordenaTopo } from '../esquisitos.ts';

export default defineCard({
  name: 'Soothsaying',
  faces: [{
    abilities: [
      activated('{3}{U}{U}', function* (c) { shuffleLibrary(c.g, c.you); }, { text: '{3}{U}{U}: Embaralhe o seu grimório.' }),
      activated('{X}', function* (c) { yield* reordenaTopo(c, c.x, 'Soothsaying'); }, { text: '{X}: Olhe as X cartas do topo do seu grimório e depois coloque-as de volta em qualquer ordem.' }),
    ],
  }],
  rulings: {},
});
