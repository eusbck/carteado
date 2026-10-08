// Sunfall
// Exile all creatures. Incubate X, where X is the number of creatures exiled this way. (Create an Incubator token with
// X +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)
import { allCreatures, defineCard, exile, incubate } from '../../motor/api.ts';

export default defineCard({
  name: 'Sunfall',
  faces: [{
    spell: {
      *effect(c) {
        // todas as criaturas são exiladas ao mesmo tempo; X conta as que de fato foram para o exílio (fichas também)
        const novos = yield* exile(c.g, allCreatures(c.g));
        const x = novos.filter((id) => id !== null && c.g.state.objects[id]?.zone === 'exile').length;
        // CR 701.53a; ruling 1: sem criaturas exiladas, incuba 0 (a ficha entra sem marcadores)
        yield* incubate(c.g, c.you, x);
      },
    },
  }],
  rulings: {
    1: 'teste: sem criaturas, incuba 0: a ficha entra sem marcadores e, transformada, morre como 0/0',
  },
});
