// Incremental Blight — Put a -1/-1 counter on target creature, two -1/-1 counters on another target
// creature, and three -1/-1 counters on a third target creature.
import { addCounters, defineCard, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Incremental Blight',
  faces: [{
    spell: {
      targets: [
        t.creature(undefined, 'criatura alvo (1 marcador)'),
        { ...t.creature(undefined, 'outra criatura alvo (2 marcadores)'), differentFrom: [0] },
        { ...t.creature(undefined, 'terceira criatura alvo (3 marcadores)'), differentFrom: [0, 1] },
      ],
      *effect(c) {
        // CR 608.2b: alvos que ficaram ilegais são ignorados; os legais ainda recebem marcadores
        for (let i = 0; i < 3; i++) {
          const id = tgt(c, i);
          if (id !== null) addCounters(c.g, { kind: 'obj', id }, '-1/-1', i + 1, c.you);
        }
      },
    },
  }],
});
