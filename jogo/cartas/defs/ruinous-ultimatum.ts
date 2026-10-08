// Ruinous Ultimatum
// Destroy all nonland permanents your opponents control.
import { controllerOf, defineCard, destroy, isLand, permanentsMatching } from '../../motor/api.ts';

export default defineCard({
  name: 'Ruinous Ultimatum',
  faces: [{
    spell: {
      *effect(c) {
        yield* destroy(c.g, permanentsMatching(c.g, (id) => !isLand(c.g, id) && c.g.isOpponent(c.you, controllerOf(c.g, id))));
      },
    },
  }],
  rulings: {},
});
