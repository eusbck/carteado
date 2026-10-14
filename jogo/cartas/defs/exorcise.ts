// Exorcise
// Exile target artifact, enchantment, or creature with power 4 or greater.
import { defineCard, exile, is, isCreature, or, power, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Exorcise',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.artifact, is.enchantment, (c, id) => isCreature(c.g, id) && power(c.g, id) >= 4), 'artefato, encantamento ou criatura com força 4 ou mais alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* exile(c.g, [id]);
      },
    },
  }],
  rulings: {},
});
