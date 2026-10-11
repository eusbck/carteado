// Shattered Angel
// Flying
// Whenever a land an opponent controls enters, you may gain 3 life.
import { and, defineCard, gainLife, is, keyword, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Shattered Angel',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.enters(and(is.land, is.opponents)), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Shattered Angel: ganhar 3 de vida?')) gainLife(c.g, c.you, 3, c.source);
      }, { text: 'Sempre que um terreno que um oponente controla entra, você pode ganhar 3 de vida.' }),
    ],
  }],
  rulings: {},
});