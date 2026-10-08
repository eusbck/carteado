// Aether Gale
// Return six target nonland permanents to their owners' hands.
import { defineCard, exactly, returnToHand, t, tgtsAll } from '../../motor/api.ts';

export default defineCard({
  name: 'Aether Gale',
  faces: [{
    spell: {
      targets: [exactly(6, t.nonlandPermanent(undefined, 'seis permanentes não terrenos alvo'))],
      *effect(c) { yield* returnToHand(c.g, tgtsAll(c, 0)); },
    },
  }],
  rulings: { 1: 'teste: CR 115.3: precisa de seis alvos diferentes; os que continuam legais voltam para a mão' },
});
