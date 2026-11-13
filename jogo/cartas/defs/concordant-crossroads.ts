// Concordant Crossroads
// World Enchantment
// All creatures have haste.
import { anthem, defineCard, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Concordant Crossroads',
  faces: [{
    abilities: [
      // ruling 1: todas as criaturas, de todos os jogadores
      anthem(is.creature, () => [{ k: 'addKeyword', kw: 'haste' }], 'Todas as criaturas têm ímpeto.'),
    ],
  }],
  rulings: {
    1: 'teste: todas as criaturas têm ímpeto, também as do oponente',
    2: 'teste: CR 704.5k — regra do mundo: a mais nova fica, a anterior vai para o cemitério',
  },
});
