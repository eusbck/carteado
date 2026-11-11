// Temporal Tribulation
// Exile two target permanents you control. Return those cards to the battlefield under their owner's control at the
// beginning of the next end step.
// Flashback {5}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { defineCard, exactly, flashback, is, t, tgtsAll } from '../../motor/api.ts';
import { exilaAteAProximaEtapaFinal } from '../startrek.ts';

export default defineCard({
  name: 'Temporal Tribulation',
  faces: [{
    altCosts: [flashback('{5}{U}')],
    spell: {
      targets: [exactly(2, t.permanent(is.yours, 'duas permanentes alvo que você controla'))],
      *effect(c) {
        const ids = tgtsAll(c, 0);
        if (ids.length) yield* exilaAteAProximaEtapaFinal(c, ids);
      },
    },
  }],
  rulings: {},
});
