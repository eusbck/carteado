// Persist
// Return target nonlegendary creature card from your graveyard to the battlefield with a -1/-1 counter on it.
import { and, defineCard, is, not, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Persist',
  faces: [{
    spell: {
      targets: [t.card('graveyard', and(is.creature, not(is.legendary)), 'carta de criatura não lendária alvo no seu cemitério')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you, counters: { '-1/-1': 1 } }], 'effect');
      },
    },
  }],
  rulings: {
  },
});
