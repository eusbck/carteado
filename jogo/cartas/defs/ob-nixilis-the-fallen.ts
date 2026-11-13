// Ob Nixilis, the Fallen
// Landfall — Whenever a land you control enters, you may have target player lose 3 life. If you do, put three +1/+1
// counters on Ob Nixilis.
import { addCounters, defineCard, loseLife, on, t, tgtPlayer, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Ob Nixilis, the Fallen',
  faces: [{
    abilities: [triggered(on.landfall(), function* (c) {
      const p = tgtPlayer(c);
      if (p === null || !(yield* yesNo(c.g, c.you, 'Ob Nixilis: o jogador alvo perde 3 de vida?'))) return;
      loseLife(c.g, p, 3, c.source);
      if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 3, c.you);
    }, { targets: [t.player()], text: 'Queda de terreno — Sempre que um terreno que você controla entra, você pode fazer o jogador alvo perder 3 de vida. Se fizer isso, coloque três marcadores +1/+1 em Ob Nixilis.' })],
  }],
  rulings: {
    1: 'regra geral: CR 119.3 — perder vida não é dano',
    2: 'regra geral: CR 115.1 — pode mirar você mesmo',
    3: 'regra geral: CR 608.2b — com o alvo ilegal, nada acontece',
  },
});
