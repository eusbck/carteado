// Crucible of Fire
// Dragon creatures you control get +3/+3.
import { and, anthem, defineCard, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Crucible of Fire',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.subtype('Dragon'), is.yours), () => [{ k: 'pt', p: 3, t: 3 }], 'As criaturas Dragon que você controla recebem +3/+3.'),
    ],
  }],
  rulings: {},
});
