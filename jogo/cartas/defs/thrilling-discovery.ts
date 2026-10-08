// Thrilling Discovery
// You gain 2 life. Then you may discard two cards. If you do, draw three cards.
import { defineCard, discard, draw, gainLife, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Thrilling Discovery',
  faces: [{
    spell: {
      *effect(c) {
        gainLife(c.g, c.you, 2, c.source);
        // "se fizer isso": só com duas cartas para descartar
        if (c.g.state.zones.hand[c.you].length < 2) return;
        if (!(yield* yesNo(c.g, c.you, 'Thrilling Discovery: descartar duas cartas para comprar três?'))) return;
        const d = yield* discard(c.g, c.you, 2);
        if (d.length === 2) yield* draw(c.g, c.you, 3);
      },
    },
  }],
  rulings: {},
});
