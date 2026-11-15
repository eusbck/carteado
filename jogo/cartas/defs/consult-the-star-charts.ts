// Consult the Star Charts
// Kicker {1}{U} (You may pay an additional {1}{U} as you cast this spell.)
// Look at the top X cards of your library, where X is the number of lands you control. Put one of those cards into your hand.
// If this spell was kicked, put two of those cards into your hand instead. Put the rest on the bottom of your library in a random order.
import { additionalCost, controlledBy, defineCard, isLand } from '../../motor/api.ts';
import { olhaTopoParaMao } from '../dimir.ts';

export default defineCard({
  name: 'Consult the Star Charts',
  faces: [{
    additionalCosts: [additionalCost('kicker', 'reforço {1}{U}', [{ k: 'mana', cost: '{1}{U}' }], { optional: true })],
    spell: {
      *effect(c) {
        // CR 608.2h: X é calculado uma vez, ao resolver, com os terrenos controlados agora.
        const x = controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length;
        yield* olhaTopoParaMao(c, x, c.paid.kicker ? 2 : 1, 'random', 'Consult the Star Charts');
      },
    },
  }],
  rulings: {
    1: 'teste: X conta os terrenos na resolução, uma vez só',
    2: 'teste: com reforço, coloca duas cartas na mão e o resto no fundo em ordem aleatória',
    3: 'regra geral: CR 702.33a — custo adicional opcional não repetível (motor/stack.ts)',
    4: 'teste: CR 707.10: copiar a mágica reforçada mantém o reforço',
    5: 'regra geral: CR 601.2f, 202.3 — custos adicionais somam ao custo total e não alteram o valor de mana (motor/stack.ts, motor/chars.ts)',
  },
});
