// Gau, Feral Youth
// Rage — Whenever Gau attacks, put a +1/+1 counter on it.
// At the beginning of each end step, if a card left your graveyard this turn, Gau deals damage equal to its power to each
// opponent.
import { addCounters, dealDamage, defineCard, lkiChars, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Gau, Feral Youth',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        if (c.g.state.objects[c.source]) addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Fúria — Sempre que Gau ataca, coloque um marcador +1/+1 nele.' }),
      triggered(on.endStep('each'), function* (c) {
        // ruling 1: fora do campo, usa a força da última vez que esteve lá
        const forca = lkiChars(c.g, c.source)?.power ?? 0;
        if (forca <= 0) return;
        dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: forca, combat: false })));
      }, {
        // ruling 2: cláusula "se" verificada ao disparar (CR 603.4)
        condition: (c) => c.g.state.turnStats[c.you].cardsLeftGraveyard > 0,
        text: 'No início de cada etapa final, se uma carta saiu do seu cemitério neste turno, Gau causa dano igual à força dele a cada oponente.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: fora do campo, usa a última força conhecida',
    2: 'teste: sem carta saindo do cemitério, não dispara',
  },
});
