// Strike It Rich
// Create a Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")
// Flashback {2}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { createTokens, defineCard, flashback } from '../../motor/api.ts';

export default defineCard({
  name: 'Strike It Rich',
  faces: [{
    altCosts: [flashback('{2}{R}')],
    spell: { *effect(c) { yield* createTokens(c.g, c.you, 'Treasure', 1); } },
  }],
  rulings: {
    1: 'teste: com retrospectiva, conjura do cemitério e depois a carta é exilada',
    2: 'regra geral: CR 702.34a — do cemitério continua sendo feitiço (motor/priority.ts)',
    3: 'regra geral: CR 601.2f — o custo total parte do custo alternativo (motor/stack.ts totalSpellCost)',
    4: 'regra geral: CR 702.34a — conjurada com retrospectiva, vai para o exílio ao sair da pilha de qualquer jeito (motor/stack.ts)',
    5: 'regra geral: CR 702.34a — vale para a carta no cemitério, mesmo sem ter sido conjurada antes',
  },
});
