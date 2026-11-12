// Index
// Look at the top five cards of your library, then put them back in any order.
import { defineCard } from '../../motor/api.ts';
import { reordenaTopoDe } from '../milagres.ts';

export default defineCard({
  name: 'Index',
  faces: [{
    spell: { *effect(c) { yield* reordenaTopoDe(c, c.you, 5, 'Index'); } },
  }],
  rulings: {},
});
