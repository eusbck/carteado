// Carrion Feeder
// This creature can't block.
// Sacrifice a creature: Put a +1/+1 counter on this creature.
import { activated, addCounters, defineCard, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Carrion Feeder',
  faces: [{
    abilities: [
      { ...keyword('cantBlock'), text: 'Esta criatura não pode bloquear.' },
      // "uma criatura": pode ser ela mesma; aí o marcador não tem onde ficar (CR 609.3)
      activated('Sacrifice a creature', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sacrifique uma criatura: Coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {},
});
