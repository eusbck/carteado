// Step Through
// Return two target creatures to their owners' hands.
// Wizardcycling {2} ({2}, Discard this card: Search your library for a Wizard card, reveal it, put it into your hand,
// then shuffle.)
import { defineCard, exactly, returnToHand, t, tgtsAll, typecycling } from '../../motor/api.ts';

export default defineCard({
  name: 'Step Through',
  faces: [{
    abilities: [typecycling('Wizard', '{2}')],
    spell: {
      targets: [exactly(2, t.creature(undefined, 'duas criaturas alvo'))],
      *effect(c) { const ids = tgtsAll(c, 0); if (ids.length) yield* returnToHand(c.g, ids); },
    },
  }],
  rulings: {
    1: 'teste: a ciclagem de Wizard procura uma carta de Wizard em vez de comprar',
    2: 'regra geral: CR 702.29e — ciclagem de tipo é ciclagem (motor/criaturas.ts typecycling, kw wizardcycling)',
  },
});
