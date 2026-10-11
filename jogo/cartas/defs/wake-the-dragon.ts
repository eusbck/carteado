// Wake the Dragon
// Create a 6/6 black and red Dragon creature token with flying, menace, and "Whenever this token deals combat damage to a
// player, gain control of target artifact that player controls."
// Flashback {6}{B}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { createTokens, defineCard, flashback } from '../../motor/api.ts';

export default defineCard({
  name: 'Wake the Dragon',
  faces: [{
    altCosts: [flashback('{6}{B}{R}')],
    spell: { *effect(c) { yield* createTokens(c.g, c.you, 'Dragon 6/6 preto e vermelho', 1); } },
  }],
  rulings: {
    1: 'regra geral: CR 702.34a — custo alternativo e exílio ao sair da pilha (motor/dsl.ts flashback, motor/actions.ts exileOnLeave)',
    2: 'regra geral: CR 702.34a — segue as permissões de tempo do tipo da carta (motor/priority.ts)',
    3: 'regra geral: CR 601.2f — o custo de retrospectiva é o custo alternativo; aumentos e reduções se aplicam a ele (motor/stack.ts totalSpellCost)',
    4: 'teste: retrospectiva {6}{B}{R}: conjurada do cemitério e exilada',
    5: 'regra geral: CR 702.34a — a retrospectiva vale para a carta no cemitério, tenha ela sido conjurada antes ou não',
    6: 'regra geral: CR 702.34a — a permissão vale assim que a carta está no cemitério (motor/priority.ts)',
  },
});
