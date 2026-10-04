// Kami of Ancient Law
// Sacrifice this creature: Destroy target enchantment.
import { activated, defineCard, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Kami of Ancient Law',
  faces: [{
    abilities: [activated('Sacrifice this creature', function* (c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); }, {
      targets: [t.enchantment()], text: 'Sacrifique esta criatura: Destrua o encantamento alvo.',
    })],
  }],
  rulings: {},
});
