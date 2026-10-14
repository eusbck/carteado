// Thrashing Brontodon
// {1}, Sacrifice this creature: Destroy target artifact or enchantment.
import { activated, defineCard, destroy, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Thrashing Brontodon',
  faces: [{
    abilities: [
      activated('{1}, Sacrifice this creature', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')], text: '{1}, Sacrifique esta criatura: Destrua o artefato ou encantamento alvo.' }),
    ],
  }],
  rulings: {},
});
