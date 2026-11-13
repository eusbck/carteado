// Gamble
// Search your library for a card, put that card into your hand, discard a card at random, then shuffle.
import { defineCard, discard, moveObjects, searchLibrary, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Gamble',
  faces: [{
    spell: {
      *effect(c) {
        const [achada] = yield* searchLibrary(c.g, c.you, c.you, { max: 1, prompt: 'Procure uma carta' });
        if (achada !== undefined) yield* moveObjects(c.g, [{ id: achada, to: 'hand' }], 'search');
        // ruling 1: o descarte aleatório pode levar a carta buscada; embaralha só depois
        yield* discard(c.g, c.you, 1, { random: true });
        shuffleLibrary(c.g, c.you);
      },
    },
  }],
  rulings: { 1: 'teste: busca uma carta e descarta uma ao acaso, que pode ser a buscada' },
});
