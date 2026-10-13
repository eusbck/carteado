// Geraldo Alckmin, o Vice Chuchu (carta própria da mesa)
// Defender
// At the beginning of your end step, if you didn't attack with a creature this turn, draw a card.
import { defineCard, draw, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Geraldo Alckmin, o Vice Chuchu',
  faces: [{
    abilities: [
      keyword('defender'),
      triggered(on.endStep('you'), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, {
        // CR 603.4: a condição é conferida ao disparar e de novo ao resolver
        condition: (c) => !c.g.state.turnStats[c.you]?.attacked,
        text: 'No início da sua etapa final, se você não atacou com uma criatura neste turno, compre uma carta.',
      }),
    ],
  }],
  rulings: {},
});
