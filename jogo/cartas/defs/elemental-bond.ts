// Elemental Bond
// Whenever a creature you control with power 3 or greater enters, draw a card.
import { and, defineCard, draw, is, on, power, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Elemental Bond',
  faces: [{
    abilities: [
      // a força é vista ao entrar, com estáticas e marcadores com que entra; aumentar depois não dispara (ruling 1)
      triggered(on.enters(and(is.creature, is.yours, (c, id) => power(c.g, id) >= 3)), function* (c) { yield* draw(c.g, c.you, 1); }, {
        text: 'Sempre que uma criatura com força 3 ou mais que você controla entra, compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: criatura que entra com força 3 ou mais compra uma carta; com força 2, não',
  },
});
