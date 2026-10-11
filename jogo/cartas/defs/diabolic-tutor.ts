// Diabolic Tutor
// Search your library for a card, put that card into your hand, then shuffle.
import { defineCard, moveObjects, searchLibrary, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Diabolic Tutor',
  faces: [{
    spell: {
      *effect(c) {
        // a carta não é revelada
        const achados = yield* searchLibrary(c.g, c.you, c.you, { max: 1, prompt: 'Procure uma carta' });
        if (achados.length) yield* moveObjects(c.g, achados.map((id) => ({ id, to: 'hand' as const })), 'search');
        shuffleLibrary(c.g, c.you);
      },
    },
  }],
  rulings: {},
});