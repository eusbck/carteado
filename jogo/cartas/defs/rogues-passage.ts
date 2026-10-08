// Rogue's Passage
// {T}: Add {C}.
// {4}, {T}: Target creature can't be blocked this turn.
import { activated, defineCard, mana, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Rogue's Passage",
  faces: [{
    abilities: [
      mana('C'),
      activated('{4}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, { targets: [t.creature()], text: '{4}, {T}: A criatura alvo não pode ser bloqueada neste turno.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 509.1h — o efeito só afeta declarações de bloqueio futuras' },
});
