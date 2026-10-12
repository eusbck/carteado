// Shard of the Nightbringer
// Flying
// Drain Life — When this creature enters, if you cast it, target opponent loses half their life, rounded up. You gain
// life equal to the life lost this way.
import { defineCard, etb, gainLife, keyword, loseLife, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Shard of the Nightbringer',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        const vida = c.g.state.players[p].life;
        if (vida <= 0) return;
        const perdida = loseLife(c.g, p, Math.ceil(vida / 2), c.source);
        if (perdida > 0) gainLife(c.g, c.you, perdida, c.source);
      }, {
        // CR 603.4: "se você a conjurou" — a permanente guarda os dados da mágica que virou
        condition: (c) => (c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj)?.data.spell !== undefined,
        targets: [t.opponent()],
        text: 'Drain Life — Quando esta criatura entra, se você a conjurou, o oponente alvo perde metade dos pontos de vida dele, arredondada para cima. Você ganha pontos de vida iguais aos pontos de vida perdidos assim.',
      }),
    ],
  }],
  rulings: {},
});