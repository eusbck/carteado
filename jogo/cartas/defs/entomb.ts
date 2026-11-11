// Entomb
// Search your library for a card, put that card into your graveyard, then shuffle.
import { defineCard } from '../../motor/api.ts';
import { tutor } from '../cedh.ts';

export default defineCard({
  name: 'Entomb',
  faces: [{ spell: { *effect(c) { yield* tutor(c, 'graveyard'); } } }],
  rulings: {},
});
