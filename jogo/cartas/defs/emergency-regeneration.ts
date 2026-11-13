// Emergency Regeneration
// Artifacts you control gain hexproof and indestructible until end of turn.
import { controlledBy, defineCard, isType, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Emergency Regeneration',
  faces: [{
    spell: {
      *effect(c) {
        untilEndOfTurn(c, controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')), [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }]);
      },
    },
  }],
  rulings: {},
});
