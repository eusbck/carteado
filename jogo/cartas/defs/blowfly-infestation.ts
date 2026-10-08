// Blowfly Infestation
// Whenever a creature dies, if it had a -1/-1 counter on it, put a -1/-1 counter on target creature.
import { addCounters, defineCard, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Blowfly Infestation',
  faces: [{
    // a condição olha a criatura como ela estava no campo (CR 603.10a); não muda depois
    abilities: [triggered(on.dies((_c, _l, o) => (o.counters['-1/-1'] ?? 0) > 0), function* (c) {
      const id = tgt(c);
      if (id !== null) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 1, c.you);
    }, { targets: [t.creature()], text: 'Sempre que uma criatura morre, se ela tinha um marcador -1/-1, coloque um marcador -1/-1 na criatura alvo.' })],
  }],
  rulings: {
    1: 'teste: um marcador só, quantos a criatura tivesse',
    2: 'teste: é obrigatório (alvo sua se só você tiver criaturas)',
  },
});
