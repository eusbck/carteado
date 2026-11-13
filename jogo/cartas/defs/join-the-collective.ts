// Join the Collective
// Destroy all creatures. Create X 1/1 colorless Borg artifact creature tokens, where X is the number of nonartifact
// creatures destroyed this way.
import { allCreatures, chars, defineCard, destroy } from '../../motor/api.ts';
import { criaBorg } from '../borg.ts';

export default defineCard({
  name: 'Join the Collective',
  faces: [{
    spell: {
      *effect(c) {
        const todas = allCreatures(c.g);
        const naoArtefato = todas.filter((id) => !chars(c.g, id).types.includes('Artifact'));
        yield* destroy(c.g, todas);
        // destruídas = as que saíram do campo pela destruição (as indestrutíveis e as regeneradas ficam)
        const x = naoArtefato.filter((id) => c.g.state.objects[id]?.zone !== 'battlefield').length;
        yield* criaBorg(c, x);
      },
    },
  }],
  rulings: {},
});
