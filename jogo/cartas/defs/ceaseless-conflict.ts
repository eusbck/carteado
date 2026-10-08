// Ceaseless Conflict
// Destroy all creatures. Then create a 3/2 red and white Spirit creature token for each nontoken creature you
// controlled that was destroyed this way.
import { allCreatures, controllerOf, createTokens, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: 'Ceaseless Conflict',
  faces: [{
    spell: {
      *effect(c) {
        const todas = allCreatures(c.g);
        const minhas = todas.filter((id) => controllerOf(c.g, id) === c.you && !c.g.state.objects[id].isToken);
        yield* destroy(c.g, todas);
        // só contam as que saíram do campo (indestrutíveis continuam lá)
        const destruidas = minhas.filter((id) => !c.g.state.objects[id]);
        yield* createTokens(c.g, c.you, 'Spirit 3/2', destruidas.length);
      },
    },
  }],
  rulings: {},
});
