// Thought Monitor
// Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)
// Flying
// When this creature enters, draw two cards.
import { defineCard, draw, etb, keyword } from '../../motor/api.ts';
import { affinity } from '../artefatos.ts';

export default defineCard({
  name: "Thought Monitor",
  faces: [{ selfCost: affinity, abilities: [keyword('flying'), etb(function*(c) { yield* draw(c.g, c.you, 2); }, { text: 'Quando entra, compre duas cartas.' })] }],
  rulings: {},
});
