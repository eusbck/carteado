// Baxter Building
// {T}: Add {C}.
// {4}, {T}: Add four mana in any combination of colors.
// {4}, {T}: Draw a card. Activate only if you control a creature with toughness 4 or greater.
import { activated, controlledBy, defineCard, draw, isCreature, mana, toughness } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Baxter Building',
  faces: [{
    abilities: [
      mana('C'),
      // '*' = cor escolhida ao ativar, uma por mana (CR 106.1a, "qualquer combinação de cores")
      mana(() => [Array<ManaType>(4).fill('*' as ManaType)], { cost: '{4}, {T}', text: '{4}, {T}: Adicione quatro manas em qualquer combinação de cores.' }),
      activated('{4}, {T}', function* (c) {
        yield* draw(c.g, c.you, 1);
      }, {
        condition: (c) => controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && (toughness(c.g, id) ?? 0) >= 4).length > 0,
        text: '{4}, {T}: Compre uma carta. Ative apenas se você controlar uma criatura com resistência 4 ou mais.',
      }),
    ],
  }],
  rulings: {},
});
