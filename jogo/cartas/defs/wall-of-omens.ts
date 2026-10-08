// Wall of Omens — Defender. When this creature enters, draw a card.
import { defineCard, draw, etb, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Wall of Omens',
  faces: [{ abilities: [keyword('defender'), etb(function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando entra, compre uma carta.' })] }],
});
