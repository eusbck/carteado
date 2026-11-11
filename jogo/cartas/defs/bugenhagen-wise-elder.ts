// Bugenhagen, Wise Elder
// Reach
// At the beginning of your upkeep, if you control a creature with power 7 or greater, draw a card.
// {T}: Add one mana of any color.
import { creaturesOf, defineCard, draw, keyword, mana, on, power, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const temForca7 = (c: SCtx) => creaturesOf(c.g, c.you).some((id) => power(c.g, id) >= 7);

export default defineCard({
  name: 'Bugenhagen, Wise Elder',
  faces: [{
    abilities: [
      keyword('reach'),
      triggered(on.upkeep('you'), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, {
        // CR 603.4: condição interveniente, conferida ao disparar e de novo ao resolver (ruling 1)
        condition: temForca7,
        text: 'No início da sua manutenção, se você controla uma criatura com força 7 ou mais, compre uma carta.',
      }),
      mana('any', { text: '{T}: Adicione um mana de qualquer cor.' }),
    ],
  }],
  rulings: {
    1: 'teste: sem criatura de força 7 ao resolver, o gatilho não faz nada',
  },
});
