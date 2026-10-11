// Mister Fantastic, Reed Richards
// Reach
// Whenever one or more tokens you control enter, you may draw a card.
import { and, defineCard, draw, is, keyword, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Mister Fantastic, Reed Richards',
  faces: [{
    abilities: [
      keyword('reach'),
      // "uma ou mais": um gatilho por lote de fichas que entram juntas
      triggered(on.entersBatch(and(is.yours, is.token)), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Mister Fantastic: comprar uma carta?')) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma ou mais fichas que você controla entram, você pode comprar uma carta.' }),
    ],
  }],
  rulings: {},
});
