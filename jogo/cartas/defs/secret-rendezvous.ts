// Secret Rendezvous
// You and target opponent each draw three cards.
import { defineCard, draw, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Secret Rendezvous',
  faces: [{
    spell: {
      targets: [t.opponent()],
      *effect(c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        // ordem APNAP (CR 101.4)
        for (const q of c.g.apnap()) if (q === c.you || q === p) yield* draw(c.g, q, 3);
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 608.2b — com o oponente alvo ilegal, a mágica não resolve e ninguém compra (motor/stack.ts)' },
});
