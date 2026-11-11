// Emergency Regeneration
// Artifacts you control gain hexproof and indestructible until end of turn.
import { controlledBy, defineCard, isType, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Emergency Regeneration',
  faces: [{
    spell: {
      *effect(c) {
        const ids = controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact'));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }]);
      },
    },
  }],
  rulings: {},
});
