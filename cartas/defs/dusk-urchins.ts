// Dusk Urchins
// Whenever this creature attacks or blocks, put a -1/-1 counter on it.
// When this creature dies, draw a card for each -1/-1 counter on it.
import { addCounters, defineCard, draw, lkiObj, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Dusk Urchins',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source)) || (e.type === 'blockers' && e.blocks.some(([b]) => b === c.source))), function* (c) {
        if (c.g.state.objects[c.source]) addCounters(c.g, { kind: 'obj', id: c.source }, '-1/-1', 1, c.you);
      }, { text: 'Sempre que esta criatura ataca ou bloqueia, coloque um marcador -1/-1 nela.' }),
      triggered(on.selfDies(), function* (c) {
        const n = lkiObj(c.g, c.source)?.counters['-1/-1'] ?? 0;
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Quando esta criatura morre, compre uma carta para cada marcador -1/-1 nela.' }),
    ],
  }],
  rulings: {
    1: 'teste: o marcador entra na declaração, antes do dano',
    2: 'regra geral: CR 509.1h — a criatura bloqueada continua bloqueada',
  },
});
