// Bitter Triumph
// As an additional cost to cast this spell, discard a card or pay 3 life.
// Destroy target creature or planeswalker.
import { defineCard, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Bitter Triumph',
  faces: [{
    additionalCosts: [{ key: 'triunfo', label: 'descartar uma carta', parts: [{ k: 'discard', n: 1 }], optional: false, orParts: [{ k: 'life', n: 3 }], orLabel: 'pagar 3 de vida' }],
    spell: {
      targets: [t.creatureOrPlaneswalker()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      },
    },
  }],
  rulings: {},
});
