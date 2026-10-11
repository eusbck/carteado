// Count on Luck
// At the beginning of your upkeep, exile the top card of your library. You may play that card this turn.
import { allowPlay, defineCard, exile, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Count on Luck',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(c.g, [topo]);
        // ruling 1: joga pagando os custos e no tempo normal da carta (terreno, só na sua fase principal)
        if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' });
      }, { text: 'No início da sua manutenção, exile a carta do topo do seu grimório. Você pode jogar essa carta neste turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: exila o topo na manutenção e a carta pode ser jogada neste turno, pagando o custo e no tempo normal',
  },
});
