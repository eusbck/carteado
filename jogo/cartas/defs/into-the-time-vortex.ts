// Into the Time Vortex
// Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs
// less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)
// Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may
// cast this card from exile without paying its mana cost.)
import { cascade, defineCard, rebound } from '../../motor/api.ts';

export default defineCard({
  name: 'Into the Time Vortex',
  faces: [{
    // CR 702.85a e 702.88a: a carta só tem as duas palavras-chave; conjurada de novo pelo ricochete, a cascata dispara outra vez
    abilities: [cascade(), rebound()],
    spell: { *effect() { /* sem efeito além das palavras-chave */ } },
  }],
  rulings: {
    1: 'regra geral: CR 202.3 — o valor de mana vem só do custo de mana (motor/chars.ts)',
    2: 'teste: CR 702.85a: a cascata resolve antes da mágica e conjura de graça a primeira carta não terreno que custa menos',
    3: 'teste: recusando conjurar, a carta achada vai para o fundo com as outras',
    4: 'teste: anulada depois de conjurada, a cascata resolve do mesmo jeito',
    5: 'regra geral: CR 702.85a — as cartas são exiladas com a face para cima (motor/conjurar-alternativo.ts cascade)',
    6: 'regra geral: CR 118.9 — sem pagar o custo de mana não dá para usar outro custo alternativo (motor/mecanicas.ts mayCastFree)',
    7: 'regra geral: CR 107.3b — X vale 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    8: 'regra geral: CR 702.85a — a mágica resultante também precisa ter valor de mana menor (motor/conjurar-alternativo.ts cascade)',
    9: 'não se aplica: cartas split ainda não são conjuráveis pela cascata (formato pendente no motor)',
  },
});
