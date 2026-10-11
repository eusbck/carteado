// Three Visits
// Search your library for a Forest card, put it onto the battlefield, then shuffle.
import { chars, defineCard, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Three Visits',
  faces: [{
    spell: {
      *effect(c) {
        // rulings 1-2: qualquer carta com o tipo Forest; como a busca pede características, pode não achar (CR 701.23b)
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.includes('Forest'), 1, 'battlefield', { tapped: false, prompt: 'Procure uma carta de Forest' });
      },
    },
  }],
  rulings: {
    1: 'teste: acha terreno não básico com o tipo Forest',
    2: 'teste: pode não achar a carta',
  },
});
