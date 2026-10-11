// Fallen Angel
// Flying
// Sacrifice a creature: This creature gets +2/+1 until end of turn.
import { activated, defineCard, keyword } from '../../motor/api.ts';
import { bombeia } from '../inferno.ts';

export default defineCard({
  name: 'Fallen Angel',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: pode sacrificar a si mesma (aí o bônus não tem onde ficar)
      activated('Sacrifice a creature', function* (c) { bombeia(c, 2, 1); }, { text: 'Sacrifique uma criatura: Esta criatura recebe +2/+1 até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: pode sacrificar a si mesma',
  },
});