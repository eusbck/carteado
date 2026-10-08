// Aberrant Return
// Put one, two, or three target creature cards from graveyards onto the battlefield under your control. Each of them
// enters with an additional -1/-1 counter on it.
import { defineCard, is, putOntoBattlefield, t, tgtsAll } from '../../motor/api.ts';

export default defineCard({
  name: 'Aberrant Return',
  faces: [{
    spell: {
      targets: [{ ...t.card('graveyard', is.creature, 'uma a três cartas de criatura alvo em cemitérios', 'any'), min: 1, max: 3 }],
      *effect(c) {
        const ids = tgtsAll(c, 0);
        // CR 614.1c: "entra com" um marcador adicional
        yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you, counters: { '-1/-1': 1 } })), 'effect');
      },
    },
  }],
  rulings: {},
});
