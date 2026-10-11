// Titania, Proud Pummeler
// First strike
// Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)
// Other creatures you control have melee.
import { and, anthem, defineCard, is, keyword, melee, MELEE } from '../../motor/api.ts';

void MELEE; // garante o registro do corpo a corpo concedido antes das cartas

export default defineCard({
  name: 'Titania, Proud Pummeler',
  faces: [{
    abilities: [
      keyword('first strike'),
      // CR 702.121a
      melee(),
      anthem(and(is.creature, is.yours, is.other), () => [{ k: 'addKeyword', kw: 'melee' }], 'As outras criaturas que você controla têm corpo a corpo.'),
    ],
  }],
  rulings: {},
});
