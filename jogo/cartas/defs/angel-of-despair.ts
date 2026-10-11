// Angel of Despair
// Flying
// When this creature enters, destroy target permanent.
import { defineCard, destroy, etb, keyword, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Angel of Despair',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.permanent()], text: 'Quando esta criatura entra, destrua a permanente alvo.' }),
    ],
  }],
  rulings: {},
});