// Ethersworn Sphinx
// Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)
// Flying
// Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card with lesser
// mana value. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)
import { cascade, defineCard, keyword } from '../../motor/api.ts';
import { affinity } from '../artefatos.ts';

export default defineCard({
  name: 'Ethersworn Sphinx',
  faces: [{
    // CR 702.41a: custa {1} a menos para cada artefato que você controla (só a parte genérica)
    selfCost: affinity,
    abilities: [
      keyword('flying'),
      // CR 702.85a: compara com o valor de mana da mágica (9), não com o que foi pago
      cascade(),
    ],
  }],
  rulings: {
    1: 'teste: CR 702.41a: a afinidade reduz só o custo genérico, {1} por artefato que você controla',
    2: 'regra geral: CR 601.2f — a redução é fixada antes de pagar os custos (motor/stack.ts totalSpellCost)',
    3: 'regra geral: CR 601.2f — aumentos de custo entram antes das reduções (motor/stack.ts totalSpellCost)',
    4: 'teste: CR 702.85a: a cascata usa o valor de mana 9, mesmo pagando menos pela afinidade',
    5: 'teste: CR 702.85a: a cascata usa o valor de mana 9, mesmo pagando menos pela afinidade',
    6: 'regra geral: CR 702.85a — exilar é obrigatório; só conjurar é opcional (cartas/defs/into-the-time-vortex.test.ts)',
    7: 'regra geral: CR 702.85a — anulada, a cascata resolve do mesmo jeito (cartas/defs/into-the-time-vortex.test.ts)',
    8: 'regra geral: CR 702.85a — as cartas são exiladas com a face para cima (motor/conjurar-alternativo.ts cascade)',
    9: 'regra geral: CR 118.9 — sem pagar o custo de mana não dá para usar outro custo alternativo (motor/mecanicas.ts mayCastFree)',
    10: 'regra geral: CR 107.3b — X vale 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    11: 'regra geral: CR 702.85a — a mágica resultante também precisa ter valor de mana menor (motor/conjurar-alternativo.ts cascade)',
    12: 'não se aplica: cartas split ainda não são conjuráveis pela cascata (formato pendente no motor)',
  },
});
