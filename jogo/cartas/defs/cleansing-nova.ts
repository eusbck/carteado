// Cleansing Nova
// Choose one —
// • Destroy all creatures.
// • Destroy all artifacts and enchantments.
import { allCreatures, defineCard, destroy, isType, modal } from '../../motor/api.ts';

export default defineCard({
  name: 'Cleansing Nova',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        { text: 'Destrua todas as criaturas', *effect(c) { const ids = allCreatures(c.g); if (ids.length) yield* destroy(c.g, ids); } },
        {
          text: 'Destrua todos os artefatos e encantamentos',
          *effect(c) {
            const s = c.g.state;
            const ids = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && (isType(c.g, id, 'Artifact') || isType(c.g, id, 'Enchantment')));
            if (ids.length) yield* destroy(c.g, ids);
          },
        },
      ]),
    },
  }],
  rulings: {},
});
