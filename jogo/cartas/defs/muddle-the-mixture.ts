// Muddle the Mixture
// Counter target instant or sorcery spell.
// Transmute {1}{U}{U} ({1}{U}{U}, Discard this card: Search your library for a card with the same mana value as this
// card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)
import { counter, defineCard, is, t, tgt, transmute } from '../../motor/api.ts';

export default defineCard({
  name: 'Muddle the Mixture',
  faces: [{
    // CR 702.53a (motor/controle.ts)
    abilities: [transmute('{1}{U}{U}')],
    spell: {
      targets: [t.spell(is.instantOrSorcery, 'mágica instantânea ou de feitiço alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
    },
  }],
  rulings: {},
});
