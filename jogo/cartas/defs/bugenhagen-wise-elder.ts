// Bugenhagen, Wise Elder
// Reach
// At the beginning of your upkeep, if you control a creature with power 7 or greater, draw a card.
// {T}: Add one mana of any color.
import { creaturesOf, defineCard, draw, keyword, mana, on, power, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const temSete = (c: SCtx) => creaturesOf(c.g, c.you).some((id) => (power(c.g, id) ?? 0) >= 7);

export default defineCard({
  name: 'Bugenhagen, Wise Elder',
  faces: [{
    abilities: [
      keyword('reach'),
      // ruling 1: condição interveniente, checada ao disparar e ao resolver (CR 603.4)
      triggered(on.upkeep('you'), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { condition: temSete, text: 'No início da sua manutenção, se você controlar uma criatura com força 7 ou mais, compre uma carta.' }),
      mana('any'),
    ],
  }],
  rulings: {
    1: 'teste: CR 603.4 — sem criatura com força 7 ou mais, não dispara; com ela, compra uma carta',
  },
});
