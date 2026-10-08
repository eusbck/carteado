// Night's Whisper — You draw two cards and lose 2 life.
import { defineCard, draw, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: "Night's Whisper",
  faces: [{ spell: { *effect(c) { yield* draw(c.g, c.you, 2); loseLife(c.g, c.you, 2, c.source); } } }],
});
