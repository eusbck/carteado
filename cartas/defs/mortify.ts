// Mortify
// Destroy target creature or enchantment.
import { defineCard, destroy, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Mortify',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.creature, is.enchantment), 'criatura ou encantamento alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
    },
  }],
  rulings: { 1: 'regra geral: CR 608.2b — basta ser criatura ou encantamento na resolução (um só alvo, sem modos)' },
});
