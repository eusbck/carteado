// Imperial Seal
// Search your library for a card, then shuffle and put that card on top. You lose 2 life.
import { defineCard, loseLife } from '../../motor/api.ts';
import { tutor } from '../cedh.ts';

export default defineCard({
  name: 'Imperial Seal',
  faces: [{
    spell: {
      *effect(c) {
        // embaralhar e pôr no topo é uma ação só (cartas/cedh.ts tutor)
        yield* tutor(c, 'top');
        loseLife(c.g, c.you, 2, c.source);
      },
    },
  }],
  rulings: {},
});
