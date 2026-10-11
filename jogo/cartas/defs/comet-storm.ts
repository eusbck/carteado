// Comet Storm
// Multikicker {1} (You may pay an additional {1} any number of times as you cast this spell.)
// Choose any target, then choose another target for each time this spell was kicked. Comet Storm deals X damage to each
// of them.
import { dealDamage, defineCard, kickedTimes, multikicker, t, tgtRef } from '../../motor/api.ts';
import type { TargetRef } from '../../motor/types.ts';

export default defineCard({
  name: 'Comet Storm',
  faces: [{
    // CR 702.33c: custo adicional que pode ser pago quantas vezes quiser
    additionalCosts: [multikicker('{1}')],
    spell: {
      // ruling 10 (CR 601.2b-c): primeiro declara X e os reforços, depois escolhe um alvo mais um por reforço, todos
      // diferentes (ruling 7)
      targets: [{
        ...t.any('qualquer alvo, mais um para cada vez que a mágica foi reforçada'),
        min: 1,
        max: (c) => 1 + kickedTimes(c.g, c.source),
        validateSet: (c, escolhidos) => escolhidos.length === 1 + kickedTimes(c.g, c.source),
      }],
      *effect(c) {
        // ruling 9 (CR 608.2b): os alvos que continuam legais recebem o dano
        const alvos = (c.targets[0] ?? []).map((_, i) => tgtRef(c, 0, i)).filter((r): r is TargetRef => r !== null);
        if (alvos.length && c.x > 0) dealDamage(c.g, alvos.map((target) => ({ source: c.source, target, amount: c.x, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — o custo total soma os custos adicionais (motor/stack.ts totalSpellCost)',
    2: 'regra geral: CR 702.33c — só o multikicker pode ser pago mais de uma vez (motor/conjurar-alternativo.ts multikicker)',
    3: 'não se aplica: Comet Storm não é um permanente',
    4: 'regra geral: CR 707.10 — a cópia de uma mágica copia as decisões, inclusive ter sido reforçada (motor/stack.ts copySpell)',
    5: 'não se aplica: Comet Storm não é um permanente',
    6: 'teste: CR 702.33c: reforçada duas vezes com X = 3, causa 3 de dano a cada um de três alvos diferentes',
    7: 'teste: CR 702.33c: reforçada duas vezes com X = 3, causa 3 de dano a cada um de três alvos diferentes',
    8: 'teste: CR 702.33c: reforçada duas vezes com X = 3, causa 3 de dano a cada um de três alvos diferentes',
    9: 'teste: se um dos alvos sai, os outros ainda recebem o dano',
    10: 'teste: sem reforçar, um alvo só',
  },
});
