// Lessons from Life
// Draw three cards. You may put a land card from your hand onto the battlefield tapped.
import { chooseItems, defineCard, draw, isLand, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Lessons from Life',
  faces: [{
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 3);
        const terrenos = c.g.state.zones.hand[c.you].filter((id) => isLand(c.g, id));
        if (!terrenos.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Lessons from Life: você pode pôr um terreno da mão no campo virado', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you, tapped: true }], 'put');
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 305.4 — pôr um terreno no campo não é jogar um terreno e não gasta a jogada de terreno do turno (motor/actions.ts putOntoBattlefield)' },
});