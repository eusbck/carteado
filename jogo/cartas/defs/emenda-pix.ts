// Emenda Pix (carta própria da mesa)
// Gain control of target creature until end of turn. Untap it. It gains haste until end of turn. Its owner creates two
// Treasure tokens.
import { createTokens, defineCard, gainControl, t, tgt, untap, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Emenda Pix',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const dono = c.g.state.objects[id].owner;
        gainControl(c.g, id, c.you, { kind: 'endOfTurn' }, c.source);
        untap(c.g, id);
        untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'haste' }]);
        if (!c.g.state.players[dono].left) yield* createTokens(c.g, dono, 'Treasure', 2);
      },
    },
  }],
  rulings: {},
});
