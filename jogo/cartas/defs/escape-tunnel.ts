// Escape Tunnel
// {T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.
// {T}, Sacrifice this land: Target creature with power 2 or less can't be blocked this turn.
import { activated, defineCard, is, land, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Escape Tunnel',
  faces: [{
    abilities: [
      land.fetchBasic(),
      // CR 608.2b: com força maior que 2 na resolução, o alvo é ilegal e nada acontece (rulings 2 e 3);
      // CR 509.1h: depois de bloqueada, a criatura continua bloqueada (rulings 1 e 4)
      activated('{T}, Sacrifice this land', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, {
        targets: [t.creature(is.powerAtMost(2), 'criatura alvo com força 2 ou menos')],
        text: '{T}, Sacrifique este terreno: A criatura alvo com força 2 ou menos não pode ser bloqueada neste turno.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1h — depois de declarada bloqueada, a criatura continua bloqueada (o efeito só afeta declarações futuras)',
    2: 'teste: CR 608.2b: com força 3 ou mais antes de resolver, não resolve; depois de resolver, continua imbloqueável',
    3: 'teste: CR 608.2b: com força 3 ou mais antes de resolver, não resolve; depois de resolver, continua imbloqueável',
    4: 'regra geral: CR 509.1h — depois de declarada bloqueada, a criatura continua bloqueada (o efeito só afeta declarações futuras)',
  },
});
