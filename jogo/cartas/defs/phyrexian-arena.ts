// Phyrexian Arena
// At the beginning of your upkeep, you draw a card and lose 1 life.
import { defineCard, draw, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Phyrexian Arena',
  faces: [{
    abilities: [triggered(on.upkeep('you'), function* (c) {
      yield* draw(c.g, c.you, 1);
      loseLife(c.g, c.you, 1, c.source);
    }, { text: 'No início da sua manutenção, você compra uma carta e perde 1 de vida.' })],
  }],
  rulings: {},
});
