// Deep Analysis
// Target player draws two cards.
// Flashback—{1}{U}, Pay 3 life.
import { defineCard, draw, flashback, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Deep Analysis',
  faces: [{
    altCosts: [flashback('{1}{U}', [{ k: 'life', n: 3 }])],
    spell: {
      targets: [t.player()],
      *effect(c) { const p = tgtPlayer(c); if (p !== null) yield* draw(c.g, p, 2); },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.34a — recapitular respeita o tempo de feitiço',
    2: 'teste: por recapitular, paga 3 de vida e vai para o exílio',
    3: 'regra geral: CR 601.2f — custo total',
    4: 'teste: por recapitular, paga 3 de vida e vai para o exílio',
    5: 'regra geral: CR 702.34a — não precisa ter sido conjurada antes',
    6: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro',
  },
});
