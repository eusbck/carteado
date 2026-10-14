// Windfall
// Each player discards their hand, then draws cards equal to the greatest number of cards a player discarded this way.
import { defineCard, draw, moveObjects } from '../../motor/api.ts';

export default defineCard({
  name: 'Windfall',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const jogadores = c.g.apnap().filter((p) => !s.players[p].left);
        // todos descartam ao mesmo tempo, sem escolhas; conta o que cada um descartou
        const descartadas = jogadores.map((p) => s.zones.hand[p].length);
        yield* moveObjects(c.g, jogadores.flatMap((p) => s.zones.hand[p].map((id) => ({ id, to: 'graveyard' as const }))), 'discard');
        const n = Math.max(0, ...descartadas);
        if (n === 0) return;
        // as compras seguem a ordem APNAP (CR 101.4)
        for (const p of jogadores) yield* draw(c.g, p, n);
      },
    },
  }],
  rulings: {},
});
