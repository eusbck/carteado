// Ghostly Pilferer
// Whenever this creature becomes untapped, you may pay {2}. If you do, draw a card.
// Whenever an opponent casts a spell from anywhere other than their hand, draw a card.
// Discard a card: This creature can't be blocked this turn.
import { activated, defineCard, draw, mayPay, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Ghostly Pilferer',
  faces: [{
    abilities: [
      // CR 603.2e: "fica desvirada" só dispara na mudança de estado
      triggered(on.custom((e, c) => e.type === 'untap' && e.obj === c.source), function* (c) {
        if (yield* mayPay(c, c.you, '{2}', 'comprar uma carta (Ghostly Pilferer)')) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que esta criatura fica desvirada, você pode pagar {2}. Se pagar, compre uma carta.' }),
      // cópias não são conjuradas (CR 707.10)
      triggered(on.custom((e, c) => e.type === 'cast' && !e.copy && c.g.isOpponent(c.you, e.player) && e.from !== 'hand'), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um oponente conjura uma mágica de qualquer lugar que não seja a mão dele, compre uma carta.' }),
      activated('Discard a card', function* (c) {
        if (c.g.state.objects[c.source]) untilEndOfTurn(c, [c.source], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, { text: 'Descarte uma carta: Esta criatura não pode ser bloqueada neste turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: dispara na etapa de desvirar e vai para a pilha na manutenção; pagando {2}, compra uma carta',
    2: 'regra geral: CR 603.2 — paga {2} uma vez só por disparo (motor/efeitos.ts mayPay)',
    3: 'regra geral: CR 603.3 — o gatilho de conjurar vai para a pilha por cima da mágica e resolve antes dela',
    4: 'regra geral: CR 117.3b — depois de o gatilho resolver, todos recebem prioridade de novo antes da mágica',
    5: 'regra geral: CR 509.1h — uma criatura já bloqueada continua bloqueada (motor/combat.ts)',
  },
});
