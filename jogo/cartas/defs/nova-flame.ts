// Nova Flame
// Put X +1/+1 counters on target creature you control. It deals damage equal to its power to each other creature.
import { addCounters, allCreatures, dealDamage, defineCard, is, power, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Nova Flame',
  faces: [{
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        if (c.x > 0) addCounters(c.g, { kind: 'obj', id }, '+1/+1', c.x, c.you);
        // o poder é lido depois dos marcadores; a fonte do dano é a criatura, não a mágica
        const n = power(c.g, id);
        const outras = allCreatures(c.g).filter((o) => o !== id);
        if (n > 0 && outras.length) dealDamage(c.g, outras.map((o) => ({ source: id, target: { kind: 'obj' as const, id: o }, amount: n, combat: false })));
      },
    },
  }],
  rulings: {},
});
