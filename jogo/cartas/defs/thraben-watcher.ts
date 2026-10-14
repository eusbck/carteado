// Thraben Watcher
// Flying, vigilance
// Other nontoken creatures you control get +1/+1 and have vigilance.
import { and, anthem, defineCard, is, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Thraben Watcher',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance'),
      anthem(and(is.creature, is.yours, is.nontoken, is.other), () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'vigilance' }], 'As outras criaturas que não são fichas que você controla recebem +1/+1 e têm vigilância.'),
    ],
  }],
  rulings: {},
});
