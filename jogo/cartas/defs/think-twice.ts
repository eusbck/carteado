// Think Twice
// Draw a card.
// Flashback {2}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { defineCard, draw, flashback } from '../../motor/api.ts';

export default defineCard({
  name: 'Think Twice',
  faces: [{
    altCosts: [flashback('{2}{U}')],
    spell: {
      *effect(c) { yield* draw(c.g, c.you, 1); },
    },
  }],
  rulings: {
    1: 'teste: da mão compra uma carta; do cemitério, por recapitular {2}{U}, compra e vai para o exílio',
    2: 'regra geral: CR 702.34a — recapitular segue o tempo da carta (motor/priority.ts canStartCast)',
    3: 'regra geral: CR 601.2f — custo total a partir do custo de recapitular; o valor de mana não muda (motor/stack.ts)',
    4: 'teste: anulada depois de conjurada por recapitular, vai para o exílio',
    5: 'regra geral: CR 702.34a — não precisa ter sido conjurada antes (motor/priority.ts castOptions)',
    6: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro',
  },
});
