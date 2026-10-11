// Panther Robot
// Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)
// Reach, trample
import { defineCard, keywords } from '../../motor/api.ts';
import { affinity } from '../artefatos.ts';

export default defineCard({
  name: 'Panther Robot',
  faces: [{ selfCost: affinity, abilities: [...keywords('reach', 'trample')] }],
  rulings: {},
});