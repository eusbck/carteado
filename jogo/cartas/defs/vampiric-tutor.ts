// Vampiric Tutor
// Search your library for a card, then shuffle and put that card on top. You lose 2 life.
import { defineCard, loseLife } from '../../motor/api.ts';
import { tutor } from '../cedh.ts';

export default defineCard({
  name: 'Vampiric Tutor',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: embaralhar e pôr no topo é uma ação só (cartas/cedh.ts tutor)
        yield* tutor(c, 'top');
        loseLife(c.g, c.you, 2, c.source);
      },
    },
  }],
  rulings: { 1: 'teste: procura uma carta, ela fica no topo do grimório e você perde 2 de vida' },
});
