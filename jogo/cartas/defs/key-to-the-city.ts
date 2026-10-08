// Key to the City
// {T}, Discard a card: Up to one target creature can't be blocked this turn.
// Whenever this artifact becomes untapped, you may pay {2}. If you do, draw a card.
import { activated, defineCard, draw, mayPay, on, t, tgt, triggered, untilEndOfTurn, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Key to the City',
  faces: [{
    abilities: [
      activated('{T}, Discard a card', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, { targets: [upTo(1, t.creature())], text: '{T}, Descarte uma carta: Até uma criatura alvo não pode ser bloqueada neste turno.' }),
      // CR 603.2e: "fica desvirado" só dispara na mudança de estado
      triggered(on.custom((e, c) => e.type === 'untap' && e.obj === c.source), function* (c) {
        if (yield* mayPay(c, c.you, '{2}', 'comprar uma carta (Key to the City)')) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que este artefato fica desvirado, você pode pagar {2}. Se pagar, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: dispara na etapa de desvirar e vai para a pilha na manutenção',
    2: 'regra geral: CR 509.1h (criatura já bloqueada continua bloqueada; o motor não desfaz bloqueios)',
    3: 'teste: paga {2} uma vez e compra uma carta',
    4: 'teste: pode ativar sem alvo',
  },
});
