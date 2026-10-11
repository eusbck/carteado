// Furnace Whelp
// Flying
// {R}: This creature gets +1/+0 until end of turn.
import { activated, defineCard, keyword } from '../../motor/api.ts';
import { bombeia } from '../inferno.ts';

export default defineCard({
  name: 'Furnace Whelp',
  faces: [{
    abilities: [
      keyword('flying'),
      activated('{R}', function* (c) { bombeia(c, 1, 0); }, { text: '{R}: Esta criatura recebe +1/+0 até o fim do turno.' }),
    ],
  }],
  rulings: {},
});