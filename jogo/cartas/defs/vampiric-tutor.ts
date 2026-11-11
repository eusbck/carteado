// Vampiric Tutor
// Search your library for a card, then shuffle and put that card on top. You lose 2 life.
import { defineCard, loseLife, moveObjects, searchLibrary, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Vampiric Tutor',
  faces: [{
    spell: {
      *effect(c) {
        const [carta] = yield* searchLibrary(c.g, c.you, c.you, { max: 1, prompt: 'Procure uma carta para pôr no topo' });
        shuffleLibrary(c.g, c.you);
        if (carta !== undefined) yield* moveObjects(c.g, [{ id: carta, to: 'library', position: 'top' }], 'effect');
        loseLife(c.g, c.you, 2, c.source);
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 119.3 — perde 2 de vida mesmo sem achar a carta' },
});
