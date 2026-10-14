// Riddlesmith
// Whenever you cast an artifact spell, you may draw a card. If you do, discard a card.
import { defineCard, discard, draw, is, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Riddlesmith',
  faces: [{
    abilities: [
      // ruling 1: resolve antes da mágica; ruling 2: compra e descarta na mesma resolução
      triggered(on.youCast(is.artifact), function* (c) {
        if (!(yield* yesNo(c.g, c.you, 'Riddlesmith: comprar uma carta e depois descartar uma?'))) return;
        const compradas = yield* draw(c.g, c.you, 1);
        if (compradas.length) yield* discard(c.g, c.you, 1);
      }, { text: 'Sempre que você conjura uma mágica de artefato, você pode comprar uma carta. Se fizer isso, descarte uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjurando um artefato, compra e descarta antes de a mágica resolver',
    2: 'teste: conjurando um artefato, compra e descarta antes de a mágica resolver',
  },
});
