// Rise of the Dark Realms
// Put all creature cards from all graveyards onto the battlefield under your control.
import { defineCard, isCreature, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Rise of the Dark Realms',
  faces: [{
    spell: {
      *effect(c) {
        const ids = c.g.playersInGame().flatMap((p) => c.g.state.zones.graveyard[p]).filter((id) => isCreature(c.g, id));
        if (ids.length) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you })), 'effect');
      },
    },
  }],
  rulings: {
  },
});
