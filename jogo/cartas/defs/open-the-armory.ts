// Open the Armory
// Search your library for an Aura or Equipment card, reveal it, put it into your hand, then shuffle.
import { defineCard, isSubtype, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Open the Armory',
  faces: [{
    spell: {
      *effect(c) {
        yield* searchTo(c, c.you, (id) => isSubtype(c.g, id, 'Aura') || isSubtype(c.g, id, 'Equipment'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de Aura ou de Equipamento' });
      },
    },
  }],
  rulings: {},
});
