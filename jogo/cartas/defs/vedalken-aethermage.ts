// Vedalken Aethermage
// Flash (You may cast this spell any time you could cast an instant.)
// When this creature enters, return target Sliver to its owner's hand.
// Wizardcycling {3} ({3}, Discard this card: Search your library for a Wizard card, reveal it, put it into your hand,
// then shuffle.)
import { defineCard, etb, is, keyword, or, returnToHand, t, tgt, typecycling } from '../../motor/api.ts';

export default defineCard({
  name: 'Vedalken Aethermage',
  faces: [{
    abilities: [
      keyword('flash'),
      // "Sliver alvo": qualquer permanente com o subtipo; um polimorfo é Sliver (CR 702.73a), mesmo que a lista de tipos de
      // criatura do motor (tirada das cartas conhecidas) não tenha Sliver
      etb(function* (c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); }, {
        targets: [t.permanent(or(is.subtype('Sliver'), is.kw('changeling')), 'Sliver alvo')],
        text: 'Quando esta criatura entra, devolva o Sliver alvo para a mão do dono.',
      }),
      typecycling('Wizard', '{3}'),
    ],
  }],
  rulings: {
    1: 'teste: a ciclagem de Wizard procura uma carta de Wizard em vez de comprar',
    2: 'regra geral: CR 702.29e — ciclagem de tipo é ciclagem (motor/criaturas.ts typecycling, kw wizardcycling)',
    3: 'regra geral: CR 702.29a — ciclagem é habilidade ativada da mão; interage com o que mexe em habilidades ativadas (motor/stack.ts)',
    4: 'teste: a ciclagem acha qualquer carta com o subtipo Wizard, inclusive um polimorfo; e pode não achar nada',
  },
});
