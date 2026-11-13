// Wood Elves
// When this creature enters, search your library for a Forest card, put that card onto the battlefield, then shuffle.
import { defineCard, etb, isSubtype, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Wood Elves',
  faces: [{
    abilities: [
      etb(function* (c) {
        // ruling 1: "um card de Floresta" (qualquer carta com o subtipo Forest, não só básica); pode não achar
        yield* searchTo(c, c.you, (id) => isSubtype(c.g, id, 'Forest'), 1, 'battlefield', { prompt: 'Wood Elves: procure uma carta de Floresta' });
      }, { text: 'Quando esta criatura entra, procure uma carta de Floresta no seu grimório, coloque-a no campo e depois embaralhe.' }),
    ],
  }],
  rulings: {
    1: 'teste: a Floresta entra desvirada; dá para não achar',
  },
});
