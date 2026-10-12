// Patriot, Shield Wielder
// {2}, {T}: Another target creature you control gets +2/+0 and gains hexproof until end of turn. (It can't be the target
// of spells or abilities your opponents control.)
import { activated, and, defineCard, is, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Patriot, Shield Wielder',
  faces: [{
    abilities: [
      activated('{2}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: 2, t: 0 }, { k: 'addKeyword', kw: 'hexproof' }]);
      }, { targets: [t.creature(and(is.yours, is.other), 'outra criatura alvo que você controla')], text: '{2}, {T}: Outra criatura alvo que você controla recebe +2/+0 e ganha resistência a magia até o fim do turno.' }),
    ],
  }],
  rulings: {},
});