// Syndicate Liquidators
// Trample
// Landfall — Whenever a land you control enters, put two +1/+1 counters on target creature you control.
import { addCounters, defineCard, is, keyword, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Syndicate Liquidators',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(on.landfall(), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, c.you);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Aterragem — Sempre que um terreno que você controla entra, coloque dois marcadores +1/+1 na criatura alvo que você controla.' }),
    ],
  }],
  rulings: {},
});
