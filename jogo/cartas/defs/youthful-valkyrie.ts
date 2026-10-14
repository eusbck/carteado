// Youthful Valkyrie
// Flying
// Whenever another Angel you control enters, put a +1/+1 counter on this creature.
import { addCounters, and, defineCard, is, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Youthful Valkyrie',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.enters(and(is.subtype('Angel'), is.yours, is.other)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que outro Angel que você controla entra, coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {},
});
