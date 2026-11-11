// Deliver from Chaos
// Exile target artifact or creature. Create X 1/1 colorless Borg artifact creature tokens, where X is that permanent's
// mana value.
import { defineCard, exile, is, lkiChars, manaValue, or, t, tgt } from '../../motor/api.ts';
import { criaBorg } from '../borg.ts';

export default defineCard({
  name: 'Deliver from Chaos',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.artifact, is.creature), 'artefato ou criatura alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const mv = manaValue(c.g, id);
        yield* exile(c.g, [id]);
        // o valor de mana é o da permanente como ela existiu por último no campo (CR 608.2h)
        yield* criaBorg(c, lkiChars(c.g, id)?.manaValue ?? mv);
      },
    },
  }],
  rulings: {},
});
