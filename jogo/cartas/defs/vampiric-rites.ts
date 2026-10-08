// Vampiric Rites
// {1}{B}, Sacrifice a creature: You gain 1 life and draw a card.
import { activated, defineCard, draw, gainLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Vampiric Rites',
  faces: [{
    abilities: [activated('{1}{B}, Sacrifice a creature', function* (c) {
      gainLife(c.g, c.you, 1, c.source);
      yield* draw(c.g, c.you, 1);
    }, { text: '{1}{B}, Sacrifique uma criatura: Você ganha 1 de vida e compra uma carta.' })],
  }],
  rulings: {},
});
