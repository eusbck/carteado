// Steelshaper's Gift
// Search your library for an Equipment card, reveal that card, put it into your hand, then shuffle.
import { defineCard, isSubtype, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: "Steelshaper's Gift",
  faces: [{
    spell: {
      *effect(c) { yield* searchTo(c, c.you, (id) => isSubtype(c.g, id, 'Equipment'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de Equipamento' }); },
    },
  }],
  rulings: {},
});