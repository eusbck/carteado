// Midnight Tilling
// Mill four cards, then you may return a permanent card from among them to your hand.
import { chooseItems, defineCard, is, mill, moveObjects, nameOf, objItem } from '../../motor/api.ts';

export default defineCard({
  name: 'Midnight Tilling',
  faces: [{
    spell: {
      *effect(c) {
        const moidas = (yield* mill(c.g, c.you, 4)).filter((id) => c.g.state.objects[id]?.zone === 'graveyard' && is.permanentCard(c, id));
        if (!moidas.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Midnight Tilling: devolva até uma carta de permanente para a mão', moidas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* moveObjects(c.g, [{ id: Number(esc[0]), to: 'hand' }], 'effect');
      },
    },
  }],
  rulings: {},
});
