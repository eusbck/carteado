// Vega, the Watcher
// Flying
// Whenever you cast a spell from anywhere other than your hand, draw a card.
import { defineCard, draw, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Vega, the Watcher',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: resolve antes da mágica, mesmo que ela seja anulada
      triggered(on.custom((e, c) => e.type === 'cast' && !e.copy && e.player === c.you && e.from !== 'hand'), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você conjura uma mágica de qualquer lugar que não a sua mão, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjurando do cemitério você compra uma carta antes de a mágica resolver; da mão, não',
  },
});
