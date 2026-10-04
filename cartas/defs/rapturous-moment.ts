// Rapturous Moment
// Draw three cards, then discard two cards. Add {U}{U}{R}{R}{R}.
import { addMana, defineCard, discard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Rapturous Moment',
  faces: [{
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 3);
        yield* discard(c.g, c.you, 2);
        addMana(c.g, c.you, ['U', 'U', 'R', 'R', 'R'], { source: c.source });
      },
    },
  }],
  rulings: {},
});
