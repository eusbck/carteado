// Unmarked Grave
// Search your library for a nonlegendary card, put that card into your graveyard, then shuffle.
import { chars, defineCard } from '../../motor/api.ts';
import { tutor } from '../cedh.ts';

export default defineCard({
  name: 'Unmarked Grave',
  faces: [{
    spell: {
      *effect(c) {
        yield* tutor(c, 'graveyard', { filter: (id) => !chars(c.g, id).supertypes.includes('Legendary'), prompt: 'Procure uma carta que não seja lendária' });
      },
    },
  }],
  rulings: {},
});
