// Arboreal Grazer — Reach. When this creature enters, you may put a land card from your hand onto the battlefield tapped.
import { chooseItems, defineCard, etb, isLand, keyword, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Arboreal Grazer',
  faces: [{
    abilities: [
      keyword('reach'),
      etb(function* (c) {
        const lands = c.g.state.zones.hand[c.you].filter((id) => isLand(c.g, id));
        if (lands.length === 0) return;
        const pick = yield* chooseItems(c.g, c.you, 'Você pode pôr um terreno da mão no campo virado', lands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (pick.length) yield* putOntoBattlefield(c.g, [{ id: Number(pick[0]), controller: c.you, tapped: true }], 'put');
      }, { text: 'Quando entra, você pode pôr uma carta de terreno da sua mão no campo virado.' }),
    ],
  }],
  rulings: {
    1: "teste: CR 305.4: pôr um terreno não conta como jogar terreno",
  },
});
