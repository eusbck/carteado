// Michelangelo, the Heart
// Trample
// Raid (the Fridge) — At the beginning of your second main phase, if you attacked this turn, put a +1/+1 counter on
// target creature and create a Food token.
// Partner—Character select
import { addCounters, createTokens, defineCard, keyword, onSecondMain, t, tgt, triggered } from '../../motor/api.ts';
import { COMIDA, SELECAO } from '../tartarugas.ts';

export default defineCard({
  name: 'Michelangelo, the Heart',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(onSecondMain(), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
        yield* createTokens(c.g, c.you, 'Food', 1);
      }, {
        condition: (c) => c.g.state.turnStats[c.you].attacked,
        targets: [t.creature()],
        text: 'Raid (the Fridge) — No início da sua segunda fase principal, se você atacou neste turno, coloque um marcador +1/+1 na criatura alvo e crie uma ficha Food.',
      }),
    ],
  }],
  rulings: {
    1: COMIDA.naoComa,
    2: SELECAO.perder,
    3: COMIDA.tipo,
    4: SELECAO.identidade,
    5: SELECAO.refere,
    6: SELECAO.dois,
    7: SELECAO.separados,
    8: COMIDA.alvos,
    9: COMIDA.qualquer,
    10: SELECAO.comecam,
    11: SELECAO.controla,
  },
});