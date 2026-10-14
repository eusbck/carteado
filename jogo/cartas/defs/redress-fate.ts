// Redress Fate
// Return all artifact and enchantment cards from your graveyard to the battlefield.
// Miracle {3}{W} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this
// turn.)
import { defineCard, isType, miracle, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Redress Fate',
  faces: [{
    abilities: [miracle('{3}{W}')],
    spell: {
      *effect(c) {
        const ids = c.g.state.zones.graveyard[c.you].filter((id) => isType(c.g, id, 'Artifact') || isType(c.g, id, 'Enchantment'));
        // todas ao mesmo tempo; a Aura escolhe o que encantar ao entrar, sem mirar (CR 303.4f)
        if (ids.length) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: a Aura que volta escolhe o que encantar sem mirar, e a carta que não é artefato nem encantamento fica no cemitério',
    2: 'regra geral: CR 303.4f — a Aura escolhe entre o que já está no campo (motor/actions.ts putOntoBattlefield)',
  },
});
