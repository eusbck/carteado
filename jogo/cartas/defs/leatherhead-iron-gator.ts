// Leatherhead, Iron Gator
// Trample, haste
// Whenever Leatherhead attacks, put two +1/+1 counters on each creature you control.
import { addCounters, creaturesOf, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Leatherhead, Iron Gator',
  faces: [{
    abilities: [
      keyword('trample'),
      keyword('haste'),
      triggered(on.selfAttacks(), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, c.you);
      }, { text: 'Sempre que Leatherhead ataca, coloque dois marcadores +1/+1 em cada criatura que você controla.' }),
    ],
  }],
  rulings: {},
});