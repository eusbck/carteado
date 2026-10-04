// Tocasia's Welcome
// Whenever one or more creatures you control with mana value 3 or less enter, draw a card. This ability triggers only
// once each turn.
import { and, defineCard, draw, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Tocasia's Welcome",
  faces: [{
    abilities: [triggered(on.entersBatch(and(is.creature, is.yours, is.mvAtMost(3))), function* (c) { yield* draw(c.g, c.you, 1); }, {
      oncePerTurn: true,
      text: 'Sempre que uma ou mais criaturas com valor de mana 3 ou menos que você controla entram, compre uma carta. Esta habilidade só dispara uma vez a cada turno.',
    })],
  }],
  rulings: {},
});
