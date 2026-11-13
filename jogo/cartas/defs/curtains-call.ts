// Curtains' Call
// Undaunted (This spell costs {1} less to cast for each opponent.)
// Destroy two target creatures.
import { defineCard, destroy, exactly, t, tgtsAll } from '../../motor/api.ts';

export default defineCard({
  name: "Curtains' Call",
  faces: [{
    // CR 702.125a-b: {1} a menos por oponente ainda na partida, fixado ao calcular o custo total
    selfCost: (c) => ({ reduce: c.g.opponents(c.you).length }),
    spell: {
      targets: [exactly(2, t.creature(undefined, 'duas criaturas alvo'))],
      *effect(c) {
        // ruling 1: só as que continuam alvos legais
        const alvos = tgtsAll(c, 0);
        if (alvos.length) yield* destroy(c.g, alvos);
      },
    },
  }],
  rulings: {
    1: 'teste: precisa de duas criaturas para conjurar; destrói as duas',
    2: 'regra geral: CR 601.2f — o custo é calculado uma vez, ao conjurar',
    3: 'teste: com três oponentes custa {2}{B}; o valor de mana continua 6',
  },
});
