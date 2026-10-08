// Veinwitch Coven
// Menace
// Whenever you gain life, you may pay {B}. If you do, return target creature card from your graveyard to your hand.
import { defineCard, is, keyword, mayPay, moveObjects, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Veinwitch Coven',
  faces: [{
    abilities: [
      keyword('menace'),
      triggered(on.youGainLife(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 4: um pagamento por evento de ganho de vida
        if (yield* mayPay(c, c.you, '{B}', 'devolver a carta de criatura')) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no seu cemitério')],
        text: 'Sempre que você ganha vida, você pode pagar {B}. Se fizer isso, devolva a carta de criatura alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 120.3 — cada fonte com vínculo com a vida é um evento de ganho de vida',
    2: 'teste: dispara uma vez por evento, qualquer que seja a quantidade',
    3: 'teste: dispara uma vez por evento, qualquer que seja a quantidade',
    4: 'teste: paga {B} uma vez por evento',
  },
});
