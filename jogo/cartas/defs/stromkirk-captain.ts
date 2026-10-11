// Stromkirk Captain
// First strike
// Other Vampire creatures you control get +1/+1 and have first strike.
import { and, anthem, defineCard, is, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Stromkirk Captain',
  faces: [{
    abilities: [
      keyword('first strike'),
      anthem(and(is.creature, is.subtype('Vampire'), is.yours, is.other), () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'first strike' }], 'As outras criaturas Vampire que você controla recebem +1/+1 e têm iniciativa.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 510.4 — quem causou dano na primeira etapa e perde a iniciativa não causa dano de novo na etapa normal (motor/combat.ts)',
  },
});
