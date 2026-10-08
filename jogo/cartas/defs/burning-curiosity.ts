// Burning Curiosity
// As an additional cost to cast this spell, you may blight 1. (You may put a -1/-1 counter on a creature you control.)
// Exile the top two cards of your library. If this spell's additional cost was paid, exile the top three cards
// instead. Until the end of your next turn, you may play those cards.
import { additionalCost, allowPlay, defineCard, exile } from '../../motor/api.ts';

export default defineCard({
  name: 'Burning Curiosity',
  faces: [{
    additionalCosts: [additionalCost('blight', 'blight 1', [{ k: 'blight', n: 1 }], { optional: true })],
    spell: {
      *effect(c) {
        const n = c.paid.blight ? 3 : 2;
        const topo = c.g.state.zones.library[c.you].slice(0, n);
        const exiladas = (yield* exile(c.g, topo)).filter((x): x is number => x !== null);
        // ruling 2: jogar segue as regras normais (tempo, custos)
        allowPlay(c.g, c.you, c.source, exiladas, { kind: 'endOfYourNextTurn', player: c.you, afterTurn: c.g.state.turn.number });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.2h — custos sem respostas no meio',
    2: 'teste: terreno exilado só pode ser jogado na fase principal, e a permissão dura até o fim do seu próximo turno',
    3: 'regra geral: CR 701.68 — pode escolher criatura que vai morrer',
    4: 'regra geral: CR 701.68b — sem criatura, não dá para fazer blight',
    5: 'regra geral: CR 603.10a — a última informação vê todos os marcadores',
    6: 'regra geral: CR 701.68a — blight põe os marcadores numa criatura só',
    7: 'regra geral: CR 704.5q — marcadores +1/+1 e -1/-1 se anulam',
  },
});
