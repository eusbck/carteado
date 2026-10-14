// Otherworldly Gaze
// Surveil 3. (Look at the top three cards of your library, then put any number of them into your graveyard and the
// rest on top of your library in any order.)
// Flashback {1}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { defineCard, flashback, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Otherworldly Gaze',
  faces: [{
    altCosts: [flashback('{1}{U}')],
    spell: { *effect(c) { yield* lookAndArrange(c.g, c.you, 3, 'surveil'); } },
  }],
  rulings: {
    1: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro e pode conjurá-la do cemitério',
    2: 'teste: conjurada do cemitério pela retrospectiva {1}{U} sem ter sido conjurada antes, e depois exilada',
    3: 'teste: conjurada do cemitério pela retrospectiva {1}{U} sem ter sido conjurada antes, e depois exilada',
    4: 'regra geral: CR 601.2f — custo total; o valor de mana não muda (motor/stack.ts)',
    5: 'regra geral: CR 702.34a — instantânea: pode ser conjurada a qualquer momento em que tiver prioridade',
    6: 'teste: conjurada do cemitério pela retrospectiva {1}{U} sem ter sido conjurada antes, e depois exilada',
    7: 'teste: vigia 3 da mão',
  },
});
