// Fabricate
// Search your library for an artifact card, reveal it, put it into your hand, then shuffle.
import { defineCard, isType, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Fabricate',
  faces: [{ spell: { *effect(c) { yield* searchTo(c, c.you, (id) => isType(c.g, id, 'Artifact'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de artefato' }); } } }],
  rulings: {},
});
