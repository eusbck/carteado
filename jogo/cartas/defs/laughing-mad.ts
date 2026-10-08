// Laughing Mad
// As an additional cost to cast this spell, discard a card.
// Draw two cards.
// Flashback {3}{R}
import { additionalCost, defineCard, draw, flashback } from '../../motor/api.ts';

export default defineCard({
  name: 'Laughing Mad',
  faces: [{
    additionalCosts: [additionalCost('discard', 'descartar uma carta', [{ k: 'discard', n: 1 }])],
    altCosts: [flashback('{3}{R}')],
    spell: { *effect(c) { yield* draw(c.g, c.you, 2); } },
  }],
  rulings: {
    1: 'teste: por recapitular, vai para o exílio',
    2: 'regra geral: CR 702.34a — não precisa ter sido conjurada antes',
    3: 'regra geral: CR 702.34a (motor: flashback)',
    4: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro',
    5: 'regra geral: CR 702.34a — respeita o tempo da carta',
    6: 'regra geral: CR 601.2f — custo total',
  },
});
