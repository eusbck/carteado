// Open the Armory
// Search your library for an Aura or Equipment card, reveal it, put it into your hand, then shuffle.
import { chars, defineCard, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Open the Armory',
  faces: [{
    spell: {
      *effect(c) {
        yield* searchTo(c, c.you, (id) => { const s = chars(c.g, id).subtypes; return s.includes('Aura') || s.includes('Equipment'); }, 1, 'hand',
          { reveal: true, prompt: 'Procure uma carta de Aura ou Equipamento' });
      },
    },
  }],
  rulings: {},
});
