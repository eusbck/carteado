// Invisible Force Field
// Up to four target permanents you control gain indestructible until end of turn.
// Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may
// cast this card from exile without paying its mana cost.)
import { defineCard, is, rebound, t, tgtsAll, untilEndOfTurn, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Invisible Force Field',
  faces: [{
    // CR 702.88a
    abilities: [rebound()],
    spell: {
      targets: [upTo(4, t.permanent(is.yours, 'permanente alvo que você controla'))],
      *effect(c) {
        const ids = tgtsAll(c, 0);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'indestructible' }]);
      },
    },
  }],
  rulings: {},
});
