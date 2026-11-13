// Ob Nixilis, the Fallen
// Landfall — Whenever a land you control enters, you may have target player lose 3 life. If you do, put three +1/+1
// counters on Ob Nixilis.
import { addCounters, defineCard, loseLife, on, t, tgtPlayer, triggered, yesNo } from '../../motor/api.ts';
import { ATERRAGEM } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Ob Nixilis, the Fallen',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        if (!(yield* yesNo(c.g, c.you, `Ob Nixilis, the Fallen: fazer ${c.g.state.players[p].name} perder 3 pontos de vida?`))) return;
        loseLife(c.g, p, 3, c.source);
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 3, c.you);
      }, { targets: [t.player()], text: 'Aterragem — Sempre que um terreno que você controla entra, você pode fazer o jogador alvo perder 3 pontos de vida. Se fizer isso, coloque três marcadores +1/+1 em Ob Nixilis.' }),
    ],
  }],
  rulings: { ...ATERRAGEM('teste: aceitando, o jogador alvo perde 3 de vida e Ob Nixilis ganha três marcadores +1/+1') },
});
