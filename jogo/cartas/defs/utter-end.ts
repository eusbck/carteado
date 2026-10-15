// Utter End
// Exile target nonland permanent.
import { defineCard, exile, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Utter End',
  faces: [{
    spell: {
      targets: [t.nonlandPermanent()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* exile(c.g, [id]);
      },
    },
  }],
  rulings: {},
});
