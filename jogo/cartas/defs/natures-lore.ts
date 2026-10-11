// Nature's Lore
// Search your library for a Forest card, put that card onto the battlefield, then shuffle.
import { chars, defineCard, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: "Nature's Lore",
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: qualquer carta com o tipo de terreno Forest, básica ou não; entra desvirada (CR 701.23)
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.includes('Forest'), 1, 'battlefield', { tapped: false, prompt: 'Procure uma carta de Forest' });
      },
    },
  }],
  rulings: {
    1: 'teste: acha terreno não básico com o tipo Forest',
  },
});
