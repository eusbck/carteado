// Crux of Fate
// Choose one —
// • Destroy all Dragon creatures.
// • Destroy all non-Dragon creatures.
import { allCreatures, chars, defineCard, destroy, modal } from '../../motor/api.ts';

export default defineCard({
  name: 'Crux of Fate',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        { text: 'Destrua todas as criaturas Dragon', *effect(c) { yield* destroy(c.g, allCreatures(c.g).filter((id) => chars(c.g, id).subtypes.includes('Dragon'))); } },
        { text: 'Destrua todas as criaturas que não são Dragon', *effect(c) { yield* destroy(c.g, allCreatures(c.g).filter((id) => !chars(c.g, id).subtypes.includes('Dragon'))); } },
      ]),
    },
  }],
  rulings: {},
});
