// Telling Time
// Look at the top three cards of your library. Put one of those cards into your hand, one on top of your library, and
// one on the bottom of your library.
import { chooseItems, defineCard, moveObjects, nameOf } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Telling Time',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        let topo = s.zones.library[c.you].slice(0, 3);
        if (topo.length === 0) return;
        const itens = (ids: ObjId[]) => ids.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } }));
        // ruling 1: com menos de três, segue as instruções na ordem para as que houver
        const [mao] = yield* chooseItems(c.g, c.you, 'Telling Time: escolha a carta que vai para a sua mão', itens(topo), 1, 1);
        topo = topo.filter((id) => id !== Number(mao));
        let fundo: ObjId | null = null;
        if (topo.length === 2) {
          const [noTopo] = yield* chooseItems(c.g, c.you, 'Telling Time: escolha a carta que fica no topo do grimório (a outra vai para o fundo)', itens(topo), 1, 1);
          fundo = topo.find((id) => id !== Number(noTopo)) ?? null;
        }
        yield* moveObjects(c.g, [{ id: Number(mao), to: 'hand' }], 'effect');
        if (fundo !== null) yield* moveObjects(c.g, [{ id: fundo, to: 'library', position: 'bottom' }], 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: com duas cartas no grimório, uma vai para a mão e a outra fica no topo',
  },
});
