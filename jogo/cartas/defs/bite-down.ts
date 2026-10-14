// Bite Down
// Target creature you control deals damage equal to its power to target creature or planeswalker you don't control.
import { dealDamage, defineCard, is, isCreature, isType, not, power, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Bite Down',
  faces: [{
    spell: {
      targets: [
        t.creature(is.yours, 'criatura alvo que você controla'),
        { ...t.permanent((c, id) => (isCreature(c.g, id) || isType(c.g, id, 'Planeswalker')) && not(is.yours)(c, id), 'criatura ou planeswalker alvo que você não controla') },
      ],
      *effect(c) {
        const minha = tgt(c, 0);
        const outra = tgt(c, 1);
        // ruling 1 (CR 608.2b): com um dos alvos ilegal, não há dano
        if (minha === null || outra === null) return;
        const n = power(c.g, minha);
        if (n > 0) dealDamage(c.g, [{ source: minha, target: { kind: 'obj', id: outra }, amount: n, combat: false }]);
      },
    },
  }],
  rulings: {
    1: 'teste: com a criatura dela fora do campo, não há dano',
  },
});
