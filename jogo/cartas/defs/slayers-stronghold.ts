// Slayers' Stronghold
// {T}: Add {C}.
// {R}{W}, {T}: Target creature gets +2/+0 and gains vigilance and haste until end of turn.
import { activated, defineCard, mana, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Slayers' Stronghold",
  faces: [{
    abilities: [
      mana('C'),
      activated('{R}{W}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: 2, t: 0 }, { k: 'addKeyword', kw: 'vigilance' }, { k: 'addKeyword', kw: 'haste' }]);
      }, { targets: [t.creature()], text: '{R}{W}, {T}: A criatura alvo recebe +2/+0 e ganha vigilância e ímpeto até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
