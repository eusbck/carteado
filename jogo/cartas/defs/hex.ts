// Hex
// Destroy six target creatures.
import { defineCard, destroy, exactly, t, tgtsAll } from '../../motor/api.ts';

export default defineCard({
  name: 'Hex',
  faces: [{
    spell: {
      // ruling 1 (CR 115.3): seis criaturas diferentes; sem seis alvos, não dá para conjurar
      targets: [exactly(6, t.creature(undefined, 'seis criaturas alvo'))],
      *effect(c) {
        // as que continuam alvos legais são destruídas (CR 608.2b)
        const ids = tgtsAll(c, 0);
        if (ids.length) yield* destroy(c.g, ids);
      },
    },
  }],
  rulings: {
    1: 'teste: precisa de seis criaturas diferentes como alvo; as que continuam legais são destruídas',
  },
});
