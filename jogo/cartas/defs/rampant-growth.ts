// Rampant Growth
// Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.
import { defineCard, isBasicLand, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Rampant Growth',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: a busca pede características, então pode não achar (CR 701.23b)
        yield* searchTo(c, c.you, (id) => isBasicLand(c.g, id), 1, 'battlefield', { tapped: true, prompt: 'Procure uma carta de terreno básico' });
      },
    },
  }],
  rulings: {
    1: 'teste: pode não achar a carta',
    2: 'teste: o terreno entra virado e não gasta a jogada de terreno do turno',
  },
});
