// Bloodsworn Steward
// Flying
// Commander creatures you control get +2/+2 and have haste.
import { and, anthem, defineCard, is, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Bloodsworn Steward',
  faces: [{
    abilities: [
      keyword('flying'),
      // qualquer comandante que você controla, seu ou de outro jogador (CR 903.3)
      anthem(and(is.creature, is.yours, (c, id) => { const o = c.g.state.objects[id]; return o.card !== null && !!c.g.state.cards[o.card]?.isCommander; }),
        () => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'haste' }], 'As criaturas comandantes que você controla recebem +2/+2 e têm ímpeto.'),
    ],
  }],
  rulings: {},
});
