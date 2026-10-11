// Body Count
// Spectacle {B} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this
// turn.)
// Draw a card for each creature that died under your control this turn.
import { defineCard, draw, spectacle } from '../../motor/api.ts';

export default defineCard({
  name: 'Body Count',
  faces: [{
    // CR 702.137a: custo alternativo, se um oponente perdeu vida neste turno
    altCosts: [spectacle('{B}')],
    spell: {
      *effect(c) {
        const n = c.g.state.turnStats[c.you]?.creaturesDied ?? 0;
        if (n > 0) yield* draw(c.g, c.you, n);
      },
    },
  }],
  rulings: {
    1: 'teste: CR 702.137a: com um oponente tendo perdido vida neste turno, pode ser conjurada por {B}',
    2: 'teste: vale ter perdido vida no turno, mesmo que o oponente ganhe vida depois',
    3: 'regra geral: CR 702.137a — o espetáculo não muda o momento de conjurar (motor/priority.ts)',
    4: 'regra geral: CR 601.2f — custo total a partir do custo alternativo (motor/stack.ts totalSpellCost)',
    5: 'teste: CR 702.137a: com um oponente tendo perdido vida neste turno, pode ser conjurada por {B}',
    6: 'regra geral: CR 702.137a — conta o que aconteceu no turno, mesmo que o oponente tenha saído (motor/state.ts turnStats)',
  },
});
