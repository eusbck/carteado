// Diabolic Vision
// Look at the top five cards of your library. Put one of them into your hand and the rest on top of your library in
// any order.
import { chooseItems, defineCard, moveObjects, nameOf } from '../../motor/api.ts';
import { reordenaTopoDe } from '../milagres.ts';

export default defineCard({
  name: 'Diabolic Vision',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 5);
        if (topo.length === 0) return;
        const [mao] = yield* chooseItems(c.g, c.you, 'Diabolic Vision: escolha a carta que vai para a sua mão',
          topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), 1, 1);
        yield* moveObjects(c.g, [{ id: Number(mao), to: 'hand' }], 'effect');
        yield* reordenaTopoDe(c, c.you, topo.length - 1, 'Diabolic Vision');
      },
    },
  }],
  rulings: {},
});
