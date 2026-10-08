// Access Tunnel
// {T}: Add {C}.
// {3}, {T}: Target creature with power 3 or less can't be blocked this turn.
import { activated, defineCard, is, mana, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Access Tunnel',
  faces: [{
    abilities: [
      mana('C'),
      activated('{3}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, { targets: [t.creature(is.powerAtMost(3), 'criatura alvo com força 3 ou menos')], text: '{3}, {T}: A criatura alvo com força 3 ou menos não pode ser bloqueada neste turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1h — o efeito só afeta declarações de bloqueio futuras',
    2: 'teste: com força acima de 3 na resolução, a habilidade não resolve; depois de resolver, aumentar a força não importa',
  },
});
