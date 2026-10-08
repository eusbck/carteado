// Brainstorm
// Draw three cards, then put two cards from your hand on top of your library in any order.
import { chooseItems, defineCard, draw, moveObjects, nameOf } from '../../motor/api.ts';

export default defineCard({
  name: 'Brainstorm',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: comprar e devolver acontecem na mesma resolução, sem prioridade no meio (CR 608.2c)
        yield* draw(c.g, c.you, 3);
        const mao = c.g.state.zones.hand[c.you];
        const n = Math.min(2, mao.length);
        if (n === 0) return;
        const itens = mao.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: c.g.state.objects[id].def } }));
        // CR 401.4: o dono escolhe a ordem; a primeira escolhida fica no topo
        const ordem = (yield* chooseItems(c.g, c.you, 'Brainstorm: escolha duas cartas da mão para pôr no topo do grimório (a primeira escolhida fica no topo)', itens, n, n, true)).map(Number);
        // cada carta posta no topo fica por cima da anterior: move de baixo para cima
        yield* moveObjects(c.g, [...ordem].reverse().map((id) => ({ id, to: 'library' as const, position: 'top' as const })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: CR 608.2c: compra três e devolve duas na mesma resolução',
  },
});
