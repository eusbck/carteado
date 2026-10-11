// Atsushi, the Blazing Sky
// Flying, trample
// When Atsushi dies, choose one —
// • Exile the top two cards of your library. Until the end of your next turn, you may play those cards.
// • Create three Treasure tokens.
import { allowPlay, createTokens, defineCard, exile, keywords, modal, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Atsushi, the Blazing Sky',
  faces: [{
    abilities: [
      ...keywords('flying', 'trample'),
      triggered(on.selfDies(), function* () { /* modos */ }, {
        modes: modal(1, 1, [
          {
            text: 'Exile as duas cartas do topo do seu grimório. Até o fim do seu próximo turno, você pode jogar essas cartas',
            *effect(c) {
              const topo = c.g.state.zones.library[c.you].slice(0, 2);
              if (!topo.length) return;
              const exiladas = (yield* exile(c.g, topo)).filter((x): x is ObjId => x !== null && x !== undefined);
              // joga pagando os custos e no tempo normal de cada carta (CR 601.2, 305.1)
              allowPlay(c.g, c.you, c.source, exiladas, { kind: 'endOfYourNextTurn', player: c.you, afterTurn: c.g.state.turn.number });
            },
          },
          { text: 'Crie três fichas de Treasure', *effect(c) { yield* createTokens(c.g, c.you, 'Treasure', 3); } },
        ]),
        text: 'Quando Atsushi morre, escolha um — exile as duas cartas do topo do seu grimório e, até o fim do seu próximo turno, você pode jogar essas cartas; ou crie três fichas de Treasure.',
      }),
    ],
  }],
  rulings: {},
});
