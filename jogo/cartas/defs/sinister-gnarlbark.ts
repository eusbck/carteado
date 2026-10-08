// Sinister Gnarlbark
// At the beginning of your end step, draw a card and blight 1.
import { blight, defineCard, draw, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Sinister Gnarlbark',
  faces: [{
    abilities: [triggered(on.endStep('you'), function* (c) {
      yield* draw(c.g, c.you, 1);
      // CR 701.68: um marcador -1/-1 numa criatura sua (pode ser ela mesma)
      yield* blight(c.g, c.you, 1);
    }, { text: 'No início da sua etapa final, compre uma carta e faça blight 1.' })],
  }],
});
