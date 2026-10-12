// Make Your Move
// Destroy target artifact, enchantment, or creature with power 4 or greater.
import { defineCard, destroy, isCreature, isType, power, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Make Your Move',
  faces: [{
    spell: {
      targets: [t.permanent((c, id) => isType(c.g, id, 'Artifact') || isType(c.g, id, 'Enchantment') || (isCreature(c.g, id) && power(c.g, id) >= 4), 'artefato, encantamento ou criatura com força 4 ou mais alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
    },
  }],
  rulings: {},
});