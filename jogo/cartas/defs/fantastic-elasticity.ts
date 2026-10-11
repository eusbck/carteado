// Fantastic Elasticity
// Choose one —
// • Return target nonland permanent to its owner's hand.
// • Return target instant or sorcery card from your graveyard to your hand.
// Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may
// cast this card from exile without paying its mana cost.)
import { defineCard, is, modal, rebound, returnToHand, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Fantastic Elasticity',
  faces: [{
    // CR 702.88a
    abilities: [rebound()],
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Devolva o permanente não terreno alvo para a mão do dono',
          targets: [t.nonlandPermanent()],
          *effect(c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); },
        },
        {
          text: 'Devolva a carta de instantânea ou feitiço alvo do seu cemitério para a sua mão',
          targets: [t.card('graveyard', is.instantOrSorcery, 'carta de instantânea ou feitiço alvo no seu cemitério', 'you')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); },
        },
      ]),
    },
  }],
  rulings: {},
});
