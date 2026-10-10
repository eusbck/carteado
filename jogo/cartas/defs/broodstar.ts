// Broodstar
// Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)
// Flying
// Broodstar's power and toughness are each equal to the number of artifacts you control.
import { defineCard, keyword } from '../../motor/api.ts';
import { affinity, artifactSize } from '../artefatos.ts';

export default defineCard({
  name: "Broodstar",
  faces: [{ selfCost: affinity, abilities: [keyword('flying'), artifactSize()] }],
  rulings: {},
});
