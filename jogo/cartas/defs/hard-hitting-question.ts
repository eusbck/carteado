// Hard-Hitting Question
// Target creature you control deals damage equal to its power to target creature or planeswalker you don't control.
import { and, dealDamage, defineCard, is, not, or, power, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Hard-Hitting Question',
  faces: [{
    spell: {
      targets: [
        t.creature(is.yours, 'criatura alvo que você controla'),
        t.permanent(and(or(is.creature, is.planeswalker), not(is.yours)), 'criatura ou planeswalker alvo que você não controla'),
      ],
      *effect(c) {
        const fonte = tgt(c, 0);
        const alvo = tgt(c, 1);
        // CR 608.2b: a criatura só causa o dano se ambos os alvos continuarem legais.
        if (fonte === null || alvo === null) return;
        const n = power(c.g, fonte);
        if (n > 0) dealDamage(c.g, [{ source: fonte, target: { kind: 'obj', id: alvo }, amount: n, combat: false }]);
      },
    },
  }],
  rulings: {},
});
