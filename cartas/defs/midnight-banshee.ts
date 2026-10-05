// Midnight Banshee
// Wither (This deals damage to creatures in the form of -1/-1 counters.)
// At the beginning of your upkeep, put a -1/-1 counter on each nonblack creature.
import { addCounters, allCreatures, chars, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Midnight Banshee',
  faces: [{
    abilities: [
      keyword('wither'),
      triggered(on.upkeep('you'), function* (c) {
        for (const id of allCreatures(c.g).filter((x) => !chars(c.g, x).colors.includes('B'))) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 1, c.you);
      }, { text: 'No início da sua manutenção, coloque um marcador -1/-1 em cada criatura que não seja preta.' }),
    ],
  }],
});
