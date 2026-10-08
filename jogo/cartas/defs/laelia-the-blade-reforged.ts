// Laelia, the Blade Reforged
// Haste
// Whenever Laelia attacks, exile the top card of your library. You may play that card this turn.
// Whenever one or more cards are put into exile from your library and/or your graveyard, put a +1/+1 counter on Laelia.
import { addCounters, allowPlay, defineCard, exile, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Laelia, the Blade Reforged',
  faces: [{
    abilities: [
      keyword('haste'),
      triggered(on.selfAttacks(), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        // ruling 4: exilada com a face para cima
        const [ex] = yield* exile(c.g, [topo]);
        // rulings 3, 5-6: joga pagando os custos, no tempo normal; um objeto novo não pode ser jogado de novo
        if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' });
      }, { text: 'Sempre que Laelia ataca, exile a carta do topo do seu grimório. Você pode jogar essa carta neste turno.' }),
      // rulings 1, 2, 7: qualquer jogador e qualquer motivo; uma vez por lote
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.to === 'exile' && (e.from === 'library' || e.from === 'graveyard') && e.owner === c.you)), function* (c) {
        if (c.g.state.objects[c.source]) addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que uma ou mais cartas são exiladas do seu grimório e/ou do seu cemitério, coloque um marcador +1/+1 em Laelia.' }),
    ],
  }],
  rulings: {
    1: 'teste: exílio do cemitério por outro jogador também conta',
    2: 'regra geral: CR 701.20 — exílio "até" é carta a carta, um lote por carta',
    3: 'regra geral: CR 601.2f — paga os custos normais; pode usar custo alternativo',
    4: 'regra geral: CR 406.3 — exiladas com a face para cima',
    5: 'regra geral: CR 305.2 — terreno só com jogada de terreno disponível',
    6: 'regra geral: CR 400.7 — objeto novo; a permissão é do objeto exilado',
    7: 'teste: o ataque exila uma carta e Laelia ganha um marcador',
  },
});
