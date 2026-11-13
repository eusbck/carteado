// The Battle of Bywater
// Destroy all creatures with power 3 or greater. Then create a Food token for each creature you control. (It's an
// artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")
import { allCreatures, createTokens, creaturesOf, defineCard, destroy, power } from '../../motor/api.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: 'The Battle of Bywater',
  faces: [{
    spell: {
      *effect(c) {
        yield* destroy(c.g, allCreatures(c.g).filter((id) => power(c.g, id) >= 3));
        // conta as criaturas depois da destruição
        yield* createTokens(c.g, c.you, 'Food', creaturesOf(c.g, c.you).length);
      },
    },
  }],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.qualquer,
    3: COMIDA.naoComa,
  },
});
