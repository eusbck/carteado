// Always Watching
// Nontoken creatures you control get +1/+1 and have vigilance.
import { and, anthem, defineCard, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Always Watching',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours, is.nontoken), () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'vigilance' }], 'As criaturas que não são fichas que você controla recebem +1/+1 e têm vigilância.'),
    ],
  }],
  rulings: {},
});
