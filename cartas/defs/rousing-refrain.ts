// Rousing Refrain
// Add {R} for each card in target opponent's hand. Until end of turn, you don't lose this mana as steps and phases end.
// Exile Rousing Refrain with three time counters on it.
// Suspend 3—{1}{R}
import { addCounters, addMana, defineCard, exile, suspend, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Rousing Refrain',
  faces: [{
    abilities: [...suspend(3, '{1}{R}')],
    spell: {
      targets: [t.opponent()],
      *effect(c) {
        const p = tgtPlayer(c);
        const n = p === null ? 0 : c.g.state.zones.hand[p].length;
        if (n > 0) addMana(c.g, c.you, Array(n).fill('R'), { source: c.source, untilEndOfTurn: true });
        // a própria mágica vai para o exílio com três marcadores de tempo (fica suspensa)
        if (c.g.state.objects[c.source]?.zone === 'stack' && !c.g.state.objects[c.source].isCopy) {
          const [ex] = yield* exile(c.g, [c.source]);
          if (ex !== null && ex !== undefined) addCounters(c.g, { kind: 'obj', id: ex }, 'time', 3, c.you);
        }
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 107.3b — sem pagar o custo de mana, X é 0',
    2: 'regra geral: CR 202.3 — valor de mana pelo custo impresso',
    3: 'regra geral: CR 702.62a — gatilho anulado não remove marcador',
    4: 'teste: ao sair o último marcador, pode conjurar sem pagar, ignorando o tempo',
    5: 'regra geral: CR 118.9a — sem custo alternativo',
    6: 'regra geral: CR 702.62a — gatilho anulado, a carta fica no exílio',
    7: 'regra geral: CR 702.62a — três habilidades (motor/mecanicas.ts)',
    8: 'regra geral: CR 406.3 — exilada com a face para cima',
    9: 'teste: suspender é ação especial que não usa a pilha',
    10: 'regra geral: CR 601.2c — alvos escolhidos ao conjurar',
    11: 'regra geral: CR 116.2f — suspende quando poderia conjurar',
    12: 'regra geral: CR 702.62a — não importa por que o último marcador saiu',
    13: 'regra geral: CR 702.62b — carta suspensa: tem suspender, está no exílio e tem marcador de tempo',
  },
});
