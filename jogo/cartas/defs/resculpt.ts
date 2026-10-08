// Resculpt
// Exile target artifact or creature. Its controller creates a 4/4 blue and red Elemental creature token.
import { controllerOf, createTokens, defineCard, exile, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Resculpt',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.artifact, is.creature), 'artefato ou criatura alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const who = controllerOf(c.g, id);
        yield* exile(c.g, [id]);
        yield* createTokens(c.g, who, 'Elemental 4/4', 1);
      },
    },
  }],
  rulings: {},
});
