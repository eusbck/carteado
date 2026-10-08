// Champion of the Perished
// Whenever another Zombie you control enters, put a +1/+1 counter on this creature.
import { addCounters, and, defineCard, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Champion of the Perished',
  faces: [{
    abilities: [
      triggered(on.enters(and(is.other, is.subtype('Zombie'), is.yours)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que outro Zombie que você controla entra, coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {},
});
