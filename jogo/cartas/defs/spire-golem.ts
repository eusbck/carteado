// Spire Golem
// Affinity for Islands (This spell costs {1} less to cast for each Island you control.)
// Flying
import { controlledBy, defineCard, isLand, isSubtype, keyword } from '../../motor/api.ts';

export default defineCard({
  name: "Spire Golem",
  faces: [{ selfCost: (c) => ({ reduce: controlledBy(c.g, c.you, (id) => isLand(c.g, id) && isSubtype(c.g, id, 'Island')).length }), abilities: [keyword('flying')] }],
  rulings: {},
});
