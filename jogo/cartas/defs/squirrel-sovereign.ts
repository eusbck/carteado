// Squirrel Sovereign
// Other Squirrels you control get +1/+1.
import { anthem, and, defineCard, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Squirrel Sovereign',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.subtype('Squirrel'), is.yours, is.other), () => [{ k: 'pt', p: 1, t: 1 }], 'Os outros Squirrels que você controla recebem +1/+1.'),
    ],
  }],
  rulings: {},
});
