// Tamiyo's Safekeeping
// Target permanent you control gains hexproof and indestructible until end of turn. You gain 2 life. (A permanent with
// hexproof and indestructible can't be the target of spells or abilities your opponents control. Damage and effects that
// say "destroy" don't destroy it.)
import { defineCard, gainLife, is, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Tamiyo's Safekeeping",
  faces: [{
    spell: {
      targets: [t.permanent(is.yours, 'permanente alvo que você controla')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }]);
        gainLife(c.g, c.you, 2, c.source);
      },
    },
  }],
  rulings: {},
});
