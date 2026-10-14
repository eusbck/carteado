// Seal of Cleansing
// Sacrifice this enchantment: Destroy target artifact or enchantment.
import { activated, defineCard, destroy, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Seal of Cleansing',
  faces: [{
    abilities: [
      activated('Sacrifice this enchantment', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')], text: 'Sacrifique este encantamento: Destrua o artefato ou encantamento alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: sacrificar é o custo: o Seal sai do campo antes de a habilidade resolver',
  },
});
