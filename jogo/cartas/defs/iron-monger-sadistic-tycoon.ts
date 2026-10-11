// Iron Monger, Sadistic Tycoon
// Flying
// Whenever a creature you control connives, put a +1/+1 counter on each Villain you control.
import { addCounters, controlledBy, defineCard, isSubtype, keyword, onYouConnive, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Iron Monger, Sadistic Tycoon',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(onYouConnive(), function* (c) {
        for (const id of controlledBy(c.g, c.you, (x) => isSubtype(c.g, x, 'Villain'))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que uma criatura que você controla trama, coloque um marcador +1/+1 em cada Villain que você controla.' }),
    ],
  }],
  rulings: {},
});
