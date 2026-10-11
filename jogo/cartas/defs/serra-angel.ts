// Serra Angel
// Flying
// Vigilance (Attacking doesn't cause this creature to tap.)
import { defineCard, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Serra Angel',
  faces: [{ abilities: [...keywords('flying', 'vigilance')] }],
  rulings: {},
});