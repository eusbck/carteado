// Takenuma, Abandoned Mire
// {T}: Add {B}.
// Channel — {3}{B}, Discard this card: Mill three cards, then return a creature or planeswalker card from your graveyard
// to your hand. This ability costs {1} less to activate for each legendary creature you control.
import { activated, chooseItems, controlledBy, cost, defineCard, isCreature, isLegendary, isType, mana, mill, moveObjects, nameOf, objItem } from '../../motor/api.ts';

export default defineCard({
  name: 'Takenuma, Abandoned Mire',
  faces: [{
    abilities: [
      mana('B'),
      activated([...cost('{3}{B}'), { k: 'discardSelf' }], function* (c) {
        yield* mill(c.g, c.you, 3);
        const cands = c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker'));
        if (!cands.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Takenuma: devolva uma carta de criatura ou planeswalker do cemitério para a mão', cands.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
        yield* moveObjects(c.g, [{ id: Number(esc), to: 'hand' }], 'effect');
      }, {
        zones: ['hand'],
        selfCost: (c) => ({ reduce: controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && isLegendary(c.g, id)).length }),
        text: 'Canalizar — {3}{B}, Descarte esta carta: Moa três cartas e depois devolva uma carta de criatura ou planeswalker do seu cemitério para a sua mão. Custa {1} a menos para cada criatura lendária que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 207.2c — canalizar é ativado da mão; descartar é custo',
    2: 'regra geral: CR 601.2f — a redução é só do genérico',
    3: 'regra geral: CR 608.2c — pode devolver uma carta que acabou de moer',
  },
});
