// Lingering Souls
// Create two 1/1 white Spirit creature tokens with flying.
// Flashback {1}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { createTokens, defineCard, flashback } from '../../motor/api.ts';

export default defineCard({
  name: 'Lingering Souls',
  faces: [{
    // CR 702.34a: do cemitério pelo custo de retrospectiva; ao sair da pilha, vai para o exílio
    altCosts: [flashback('{1}{B}')],
    spell: {
      *effect(c) { yield* createTokens(c.g, c.you, 'Spirit 1/1', 2); },
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.2f, 202.3 — custo total a partir do custo alternativo; o valor de mana continua 3',
    2: 'teste: por retrospectiva, do cemitério sem ter sido conjurada antes: cria as fichas e vai para o exílio',
    3: 'teste: CR 702.34a, 307.1: por retrospectiva, só no tempo de feitiço',
    4: 'teste: por retrospectiva, do cemitério sem ter sido conjurada antes: cria as fichas e vai para o exílio',
    5: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro',
    6: 'teste: por retrospectiva, do cemitério sem ter sido conjurada antes: cria as fichas e vai para o exílio',
    7: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro',
    8: 'teste: CR 702.34a: anulada depois de conjurada por retrospectiva, vai para o exílio',
    9: 'teste: CR 702.34a: anulada depois de conjurada por retrospectiva, vai para o exílio',
    10: 'regra geral: CR 601.2f, 202.3 — custo total a partir do custo alternativo; o valor de mana continua 3',
    11: 'teste: CR 702.34a, 307.1: por retrospectiva, só no tempo de feitiço',
    12: 'teste: por retrospectiva, do cemitério sem ter sido conjurada antes: cria as fichas e vai para o exílio',
  },
});
