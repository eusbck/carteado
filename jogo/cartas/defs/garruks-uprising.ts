// Garruk's Uprising
// When this enchantment enters, if you control a creature with power 4 or greater, draw a card.
// Creatures you control have trample. (Each of those creatures can deal excess combat damage to the player or
// planeswalker it's attacking.)
// Whenever a creature you control with power 4 or greater enters, draw a card.
import { and, anthem, defineCard, draw, etb, is, on, power, triggered } from '../../motor/api.ts';
import { temForca4 } from '../dinossauros.ts';

export default defineCard({
  name: "Garruk's Uprising",
  faces: [{
    abilities: [
      // CR 603.4: "se" interveniente, conferido ao disparar e ao resolver (ruling 3); compra só uma (ruling 1)
      etb(function* (c) { yield* draw(c.g, c.you, 1); }, {
        condition: (c) => temForca4(c.g, c.you),
        text: 'Quando este encantamento entra, se você controla uma criatura com força 4 ou mais, compre uma carta.',
      }),
      anthem(and(is.creature, is.yours), () => [{ k: 'addKeyword', kw: 'trample' }], 'As criaturas que você controla têm atropelar.'),
      // a força é vista quando a criatura entra, já com marcadores e estáticas (ruling 2); depois disso não importa (ruling 4)
      triggered(on.enters(and(is.creature, is.yours, (c, id) => power(c.g, id) >= 4)), function* (c) { yield* draw(c.g, c.you, 1); }, {
        text: 'Sempre que uma criatura com força 4 ou mais que você controla entra, compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: ao entrar, compra uma carta só se você controla uma criatura com força 4 ou mais',
    2: 'teste: criatura que entra com força 4 ou mais compra uma carta; com força menor, não',
    3: 'teste: ao entrar, compra uma carta só se você controla uma criatura com força 4 ou mais',
    4: 'teste: criatura que entra com força 4 ou mais compra uma carta; com força menor, não',
  },
});
