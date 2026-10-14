// Segovian Angel
// Flying, vigilance
import { defineCard, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Segovian Angel',
  faces: [{ abilities: [...keywords('flying', 'vigilance')] }],
  rulings: {},
});
