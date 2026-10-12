// Super Combo
// Replicate {2} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets
// for the copies.)
// Target creature you control deals damage equal to its power to target creature an opponent controls.
import { dealDamage, defineCard, is, power, replicate, t } from '../../motor/api.ts';

const REPLICAR = replicate('{2}');

export default defineCard({
  name: 'Super Combo',
  faces: [{
    additionalCosts: [REPLICAR.cost],
    abilities: [REPLICAR.trigger],
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla'), t.creature(is.opponents, 'criatura alvo que um oponente controla')],
      *effect(c) {
        const a = c.targets[0]?.[0];
        const b = c.targets[1]?.[0];
        // ruling 2: com qualquer um dos dois alvos ilegal, esta cópia não causa dano
        if (!a || !b || a.kind !== 'obj' || b.kind !== 'obj') return;
        if (c.g.state.objects[a.id]?.zone !== 'battlefield' || c.g.state.objects[b.id]?.zone !== 'battlefield') return;
        dealDamage(c.g, [{ source: a.id, target: b, amount: power(c.g, a.id), combat: false }]);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 707.10 — cada cópia é uma mágica à parte e é anulada separadamente (motor/stack.ts)',
    2: 'regra geral: CR 608.2b — o alvo ilegal não causa nem recebe o dano dessa cópia (cartas/defs/super-combo.ts)',
  },
});