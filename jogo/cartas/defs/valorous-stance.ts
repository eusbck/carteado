// Valorous Stance
// Choose one —
// • Target creature gains indestructible until end of turn. (Damage and effects that say "destroy" don't destroy it.)
// • Destroy target creature with toughness 4 or greater.
import { defineCard, destroy, modal, t, tgt, toughness, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Valorous Stance',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'A criatura alvo ganha indestrutível até o fim do turno',
          targets: [t.creature()],
          *effect(c) { const id = tgt(c); if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'indestructible' }]); },
        },
        {
          text: 'Destrua a criatura alvo com resistência 4 ou maior',
          targets: [t.creature((c, id) => toughness(c.g, id) >= 4, 'criatura alvo com resistência 4 ou maior')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
      ]),
    },
  }],
  rulings: {},
});