// Imbrochável (carta própria da mesa)
// Untap target creature you control. It gains indestructible and trample until end of turn. If it's your commander, it
// also gets +3/+3 until end of turn.
import { and, defineCard, is, t, tgt, untap, untilEndOfTurn } from '../../motor/api.ts';
import { ehComandanteDe } from '../wakanda.ts';

export default defineCard({
  name: 'Imbrochável',
  faces: [{
    spell: {
      targets: [t.creature(and(is.yours), 'criatura alvo que você controla')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        untap(c.g, id);
        untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'indestructible' }, { k: 'addKeyword', kw: 'trample' }]);
        if (ehComandanteDe(c.g, id, c.you)) untilEndOfTurn(c, [id], [{ k: 'pt', p: 3, t: 3 }]);
      },
    },
  }],
  rulings: {},
});
