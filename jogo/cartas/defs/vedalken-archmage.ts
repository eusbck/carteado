// Vedalken Archmage
// Whenever you cast an artifact spell, draw a card.
import { defineCard, draw, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Vedalken Archmage",
  faces: [{ abilities: [triggered(on.youCast(is.artifact), function*(c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que conjura uma mágica de artefato, compre uma carta.' })] }],
  rulings: {},
});
