// Universal Automaton
// Changeling (This card is every creature type.)
import { changeling, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Universal Automaton',
  faces: [{ abilities: [changeling()] }],
  rulings: {},
});
