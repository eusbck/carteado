// Army of the Damned
// Create thirteen tapped 2/2 black Zombie creature tokens.
// Flashback {7}{B}{B}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { createTokens, defineCard, flashback } from '../../motor/api.ts';

export default defineCard({
  name: 'Army of the Damned',
  faces: [{
    // CR 702.34a: conjurável do cemitério pelo custo de retrospectiva; depois vai para o exílio
    altCosts: [flashback('{7}{B}{B}{B}')],
    spell: { *effect(c) { yield* createTokens(c.g, c.you, 'Zombie 2/2', 13, { tapped: true }); } },
  }],
  rulings: {
    1: 'teste: por retrospectiva, paga o custo dela e vai para o exílio',
    2: 'teste: por retrospectiva, só no tempo de feitiço; com 9 terrenos não dá para pagar',
    3: 'regra geral: CR 601.2f — custo total; o valor de mana continua 8 (CR 202.3)',
    4: 'teste: por retrospectiva, anulada também vai para o exílio',
    5: 'regra geral: CR 702.34a — não precisa ter sido conjurada antes (teste começa no cemitério)',
    6: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro',
  },
});
