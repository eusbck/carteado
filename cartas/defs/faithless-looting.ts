// Faithless Looting
// Draw two cards, then discard two cards.
// Flashback {2}{R}
import { defineCard, discard, draw, flashback } from '../../motor/api.ts';

export default defineCard({
  name: 'Faithless Looting',
  faces: [{
    altCosts: [flashback('{2}{R}')],
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 2);
        yield* discard(c.g, c.you, 2);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2 — tudo durante a resolução',
    2: 'regra geral: CR 702.34a (motor: flashback)',
    3: 'regra geral: CR 702.34a — não precisa ter sido conjurada antes',
    4: 'regra geral: CR 702.34a — recapitular respeita o tempo de feitiço',
    5: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro',
    6: 'regra geral: CR 601.2f — custo total',
    7: 'teste: por recapitular, vai para o exílio',
  },
});
