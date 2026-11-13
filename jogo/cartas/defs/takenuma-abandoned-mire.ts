// Takenuma, Abandoned Mire
// {T}: Add {B}.
// Channel — {3}{B}, Discard this card: Mill three cards, then return a creature or planeswalker card from your
// graveyard to your hand. This ability costs {1} less to activate for each legendary creature you control.
import {
  activated, chars, chooseItems, controlledBy, cost, defineCard, isCreature, isLegendary, mana, mill, moveObjects, nameOf, objItem,
} from '../../motor/api.ts';

export default defineCard({
  name: 'Takenuma, Abandoned Mire',
  faces: [{
    abilities: [
      mana('B'),
      // canalizar é palavra de habilidade (CR 207.2c): ativada da mão; descartar é custo (ruling 2)
      activated([...cost('{3}{B}'), { k: 'discardSelf' }], function* (c) {
        yield* mill(c.g, c.you, 3);
        // ruling 1: a carta é escolhida depois de moer, entre todas do cemitério
        const cands = c.g.state.zones.graveyard[c.you].filter((id) => { const t = chars(c.g, id).types; return t.includes('Creature') || t.includes('Planeswalker'); });
        if (!cands.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Takenuma: devolva uma carta de criatura ou planeswalker do seu cemitério para a mão', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        yield* moveObjects(c.g, [{ id: Number(esc), to: 'hand' }], 'effect');
      }, {
        zones: ['hand'],
        // CR 601.2f, 602.2b: reduz só o genérico
        selfCost: (c) => ({ reduce: controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && isLegendary(c.g, id)).length }),
        text: 'Canalizar — {3}{B}, Descarte esta carta: Moa três cartas e depois devolva uma carta de criatura ou planeswalker do seu cemitério para a sua mão. Custa {1} a menos para ativar para cada criatura lendária que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a carta devolvida pode ser uma das moídas agora',
    2: 'teste: descartar é parte do custo: a carta vai para o cemitério ao ativar',
    3: 'não se aplica: a habilidade não tem alvo',
  },
});
