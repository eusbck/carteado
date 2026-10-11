// The Mouth of Sauron
// When The Mouth of Sauron enters, target player mills three cards. Then amass Orcs X, where X is the number of instant and
// sorcery cards in that player's graveyard. (Put X +1/+1 counters on an Army you control. It's also an Orc. If you don't
// control an Army, create a 0/0 black Orc Army creature token first.)
import { amass, defineCard, etb, is, mill, t, tgtPlayer } from '../../motor/api.ts';
import { REUNIR } from '../mordor.ts';

export default defineCard({
  name: 'The Mouth of Sauron',
  faces: [{
    abilities: [
      etb(function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        yield* mill(c.g, p, 3);
        // X é contado depois de moer; reunir 0 não faz nada (CR 701.47a)
        const x = c.g.state.zones.graveyard[p].filter((id) => is.instantOrSorcery({ g: c.g, you: c.you, source: c.source }, id)).length;
        if (x > 0) yield* amass(c.g, c.you, 'Orc', x);
      }, { targets: [t.player()], text: 'Quando The Mouth of Sauron entra, o jogador alvo moi três cartas. Depois reúna Orcs X, onde X é o número de cartas instantâneas e de feitiço no cemitério desse jogador.' }),
    ],
  }],
  rulings: {
    1: REUNIR.escrita,
    2: REUNIR.como,
    3: REUNIR.zumbis,
    4: REUNIR.varios,
    5: REUNIR.entra00,
    6: REUNIR.alvos,
    7: REUNIR.reunido,
  },
});
