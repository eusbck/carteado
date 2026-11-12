// Rivendell
// Rivendell enters tapped unless you control a legendary creature.
// {T}: Add {U}.
// {1}{U}, {T}: Scry 2. Activate only if you control a legendary creature.
import { activated, controlledBy, defineCard, entersTapped, isCreature, isLegendary, lookAndArrange, mana } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const temLendaria = (c: SCtx): boolean => controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && isLegendary(c.g, id)).length > 0;

export default defineCard({
  name: 'Rivendell',
  faces: [{
    abilities: [
      // ruling 1: a criatura lendária precisa já estar no campo (CR 614.12)
      entersTapped(temLendaria),
      mana('U'),
      activated('{1}{U}, {T}', function* (c) { yield* lookAndArrange(c.g, c.you, 2, 'scry'); }, {
        condition: temLendaria,
        text: '{1}{U}, {T}: Vidência 2. Ative somente se você controlar uma criatura lendária.',
      }),
    ],
  }],
  rulings: { 1: 'teste: entra desvirado só com uma criatura lendária já no campo' },
});
