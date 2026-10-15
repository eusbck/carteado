// Brainstone
// {2}, {T}, Sacrifice this artifact: Draw three cards, then put two cards from your hand on top of your library in any
// order.
import { activated, chooseItems, defineCard, draw, moveObjects, nameOf } from '../../motor/api.ts';

export default defineCard({
  name: 'Brainstone',
  faces: [{
    abilities: [
      activated('{2}, {T}, Sacrifice this artifact', function* (c) {
        yield* draw(c.g, c.you, 3);
        const mao = c.g.state.zones.hand[c.you];
        const n = Math.min(2, mao.length);
        if (n === 0) return;
        // a primeira escolhida fica no topo
        const ids = (yield* chooseItems(c.g, c.you, `Brainstone: escolha ${n === 1 ? 'uma carta' : 'duas cartas'} da sua mão para pôr no topo do grimório (a primeira escolhida fica no topo)`,
          mao.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: c.g.state.objects[id].def } })), n, n, true)).map(Number);
        // a última vai primeiro, para a primeira escolhida terminar no topo
        for (const id of [...ids].reverse()) yield* moveObjects(c.g, [{ id, to: 'library', position: 'top' }], 'effect');
      }, { text: '{2}, {T}, Sacrifique este artefato: Compre três cartas e depois coloque duas cartas da sua mão no topo do seu grimório em qualquer ordem.' }),
    ],
  }],
  rulings: {},
});
