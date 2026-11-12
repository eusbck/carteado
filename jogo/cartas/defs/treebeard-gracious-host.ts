// Treebeard, Gracious Host
// Trample, ward {2}
// When Treebeard enters, create two Food tokens.
// Whenever you gain life, put that many +1/+1 counters on target Halfling or Treefolk.
import { addCounters, createTokens, defineCard, etb, is, keyword, on, or, t, tgt, triggered, ward } from '../../motor/api.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: 'Treebeard, Gracious Host',
  faces: [{
    abilities: [
      keyword('trample'),
      ...ward('{2}'),
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Food', 2); }, { text: 'Quando Treebeard entra, crie duas fichas Food.' }),
      triggered(on.youGainLife(), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', c.event.amount as number, c.you);
      }, {
        targets: [t.creature(or(is.subtype('Halfling'), is.subtype('Treefolk')), 'Halfling ou Treefolk alvo')],
        text: 'Sempre que você ganha vida, coloque essa quantidade de marcadores +1/+1 no Halfling ou Treefolk alvo.',
      }),
    ],
  }],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.qualquer,
    3: COMIDA.naoComa,
  },
});
