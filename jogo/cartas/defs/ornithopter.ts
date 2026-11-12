// Ornithopter
// Flying
import { defineCard, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Ornithopter',
  faces: [{ abilities: [keyword('flying')] }],
  rulings: {},
});
