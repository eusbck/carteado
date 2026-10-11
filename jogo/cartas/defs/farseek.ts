// Farseek
// Search your library for a Plains, Island, Swamp, or Mountain card, put it onto the battlefield tapped, then shuffle.
import { chars, defineCard, searchTo } from '../../motor/api.ts';

const TIPOS = ['Plains', 'Island', 'Swamp', 'Mountain'];

export default defineCard({
  name: 'Farseek',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: qualquer terreno com um desses tipos, básico ou não, mesmo que também seja Forest (CR 701.23a)
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.some((s) => TIPOS.includes(s)), 1, 'battlefield', {
          tapped: true, prompt: 'Procure uma carta de Plains, Island, Swamp ou Mountain',
        });
      },
    },
  }],
  rulings: {
    1: 'teste: acha terreno não básico com um dos tipos, mesmo sendo também Forest',
  },
});
