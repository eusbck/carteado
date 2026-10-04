// Reanimate — Put target creature card from a graveyard onto the battlefield under your control.
// You lose life equal to that card's mana value.
import { defineCard, is, loseLife, manaValue, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Reanimate',
  faces: [{
    spell: {
      targets: [t.card('graveyard', is.creature, 'carta de criatura alvo num cemitério', 'any')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const mv = manaValue(c.g, id);
        yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'reanimate');
        loseLife(c.g, c.you, mv, c.source);
      },
    },
  }],
});
