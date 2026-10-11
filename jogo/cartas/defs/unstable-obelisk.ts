// Unstable Obelisk
// {T}: Add {C}.
// {7}, {T}, Sacrifice this artifact: Destroy target permanent.
import { activated, defineCard, destroy, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Unstable Obelisk',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      activated('{7}, {T}, Sacrifice this artifact', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.permanent()], text: '{7}, {T}, Sacrifique este artefato: Destrua o permanente alvo.' }),
    ],
  }],
  rulings: {},
});
