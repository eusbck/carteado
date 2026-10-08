// Primary Research
// When this enchantment enters, return target nonland permanent card with mana value 3 or less from your graveyard to the
// battlefield.
// At the beginning of your end step, if a card left your graveyard this turn, draw a card.
import { and, defineCard, draw, etb, is, not, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Primary Research',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, { targets: [t.card('graveyard', and(is.permanentCard, not(is.land), is.mvAtMost(3)), 'carta de permanente não terreno alvo com valor de mana 3 ou menos')], text: 'Quando este encantamento entra, devolva a carta de permanente não terreno alvo com valor de mana 3 ou menos do seu cemitério ao campo.' }),
      triggered(on.endStep('you'), function* (c) { yield* draw(c.g, c.you, 1); }, {
        // ruling 1: verificado ao começar a etapa final (CR 603.4)
        condition: (c) => c.g.state.turnStats[c.you].cardsLeftGraveyard > 0,
        text: 'No início da sua etapa final, se uma carta saiu do seu cemitério neste turno, compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a carta devolvida ao entrar já conta para a compra',
    2: 'regra geral: CR 202.3e — X vale 0 no cemitério',
  },
});
