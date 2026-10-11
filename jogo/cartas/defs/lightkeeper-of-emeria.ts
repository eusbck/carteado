// Lightkeeper of Emeria
// Multikicker {W} (You may pay an additional {W} any number of times as you cast this spell.)
// Flying
// When this creature enters, you gain 2 life for each time it was kicked.
import { defineCard, etb, gainLife, keyword, kickedTimes, multikicker } from '../../motor/api.ts';

export default defineCard({
  name: 'Lightkeeper of Emeria',
  faces: [{
    // CR 702.33c: custo adicional que pode ser pago quantas vezes quiser
    additionalCosts: [multikicker('{W}')],
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        // CR 702.33d: quantas vezes a mágica que virou este permanente foi reforçada
        const n = kickedTimes(c.g, c.source);
        if (n > 0) gainLife(c.g, c.you, 2 * n, c.source);
      }, { text: 'Quando esta criatura entra, você ganha 2 de vida para cada vez que ela foi reforçada.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 702.33c: com o multikicker pago três vezes, ganha 6 de vida',
    2: 'regra geral: CR 702.33c — só o multikicker pode ser pago mais de uma vez (motor/conjurar-alternativo.ts multikicker)',
    3: 'teste: posta no campo sem ser conjurada, não foi reforçada e não ganha vida',
    4: 'regra geral: CR 707.10 — a cópia de uma mágica copia as decisões, inclusive ter sido reforçada (motor/stack.ts copySpell)',
    5: 'teste: posta no campo sem ser conjurada, não foi reforçada e não ganha vida',
    6: 'regra geral: CR 601.2f — o custo total soma os custos adicionais (motor/stack.ts totalSpellCost)',
  },
});
