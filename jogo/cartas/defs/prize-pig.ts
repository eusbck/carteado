// Prize Pig
// Whenever you gain life, put that many ribbon counters on this creature. Then if there are three or more ribbon
// counters on this creature, remove those counters and untap it.
// {T}: Add one mana of any color.
import { addCounters, defineCard, mana, on, removeCounters, triggered, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Prize Pig',
  faces: [{
    abilities: [
      triggered(on.youGainLife(), function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o || o.zone !== 'battlefield') return;
        addCounters(c.g, { kind: 'obj', id: c.source }, 'ribbon', c.event.amount as number, c.you);
        const n = c.g.state.objects[c.source]?.counters.ribbon ?? 0;
        if (n >= 3) {
          removeCounters(c.g, { kind: 'obj', id: c.source }, 'ribbon', n);
          untap(c.g, c.source);
        }
      }, { text: 'Sempre que você ganha vida, coloque essa quantidade de marcadores de fita nesta criatura. Depois, se houver três ou mais marcadores de fita nela, remova esses marcadores e desvire-a.' }),
      mana('any'),
    ],
  }],
  rulings: {
    1: 'teste: com três ou mais marcadores de fita, remove todos e desvira o porco, mesmo já desvirado',
  },
});
