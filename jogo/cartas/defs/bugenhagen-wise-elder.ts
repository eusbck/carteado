// Bugenhagen, Wise Elder
// Reach
// At the beginning of your upkeep, if you control a creature with power 7 or greater, draw a card.
// {T}: Add one mana of any color.
import { controlledBy, defineCard, draw, isCreature, keyword, mana, on, power, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const temSete = (c: SCtx) => controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && power(c.g, id) >= 7).length > 0;

export default defineCard({
  name: 'Bugenhagen, Wise Elder',
  faces: [{
    abilities: [
      keyword('reach'),
      // CR 603.4: condição interveniente, conferida ao disparar e na resolução (ruling 1)
      triggered(on.upkeep('you'), function* (c) { yield* draw(c.g, c.you, 1); }, {
        condition: temSete,
        text: 'No início da sua manutenção, se você controlar uma criatura com força 7 ou mais, compre uma carta.',
      }),
      mana('any'),
    ],
  }],
  rulings: { 1: 'teste: ruling 1: sem criatura de força 7 ou mais, não dispara' },
});
