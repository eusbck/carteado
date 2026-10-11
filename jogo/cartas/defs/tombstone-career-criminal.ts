// Tombstone, Career Criminal
// When Tombstone enters, return target Villain card from your graveyard to your hand.
// Villain spells you cast cost {1} less to cast.
import { defineCard, etb, is, returnToHand, staticAbility, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Tombstone, Career Criminal',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* returnToHand(c.g, [id]);
      }, { targets: [t.card('graveyard', is.subtype('Villain'), 'carta de Villain alvo no seu cemitério')], text: 'Quando Tombstone entra, devolva a carta de Villain alvo do seu cemitério para a sua mão.' }),
      // CR 601.2f: reduz só a parte genérica do custo total
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.subtypes.includes('Villain') ? { reduce: 1 } : null) },
        text: 'As mágicas de Villain que você conjura custam {1} a menos.',
      }),
    ],
  }],
  rulings: {},
});
