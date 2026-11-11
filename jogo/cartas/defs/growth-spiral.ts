// Growth Spiral
// Draw a card. You may put a land card from your hand onto the battlefield.
import { chooseItems, defineCard, draw, isLand, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Growth Spiral',
  faces: [{
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 1);
        const terrenos = c.g.state.zones.hand[c.you].filter((id) => isLand(c.g, id));
        if (!terrenos.length) return;
        // ruling 1: não é jogar terreno; vale fora do seu turno e depois da jogada de terreno
        const esc = yield* chooseItems(c.g, c.you, 'Growth Spiral: você pode pôr uma carta de terreno da sua mão no campo', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you }], 'effect');
      },
    },
  }],
  rulings: { 1: 'teste: compra uma carta e põe um terreno da mão no campo, mesmo já tendo jogado terreno no turno' },
});
