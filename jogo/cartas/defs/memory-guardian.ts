// Memory Guardian
// Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)
// Flying
import { defineCard, keyword } from '../../motor/api.ts';
import { affinity } from '../artefatos.ts';

export default defineCard({
  name: "Memory Guardian",
  faces: [{ selfCost: affinity, abilities: [keyword('flying')] }],
  rulings: {},
});
