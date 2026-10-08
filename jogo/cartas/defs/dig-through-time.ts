// Dig Through Time
// Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)
// Look at the top seven cards of your library. Put two of them into your hand and the rest on the bottom of your
// library in any order.
import { chooseItems, defineCard, moveObjects, nameOf } from '../../motor/api.ts';
import type { ChoiceItem } from '../../motor/types.ts';

export default defineCard({
  name: 'Dig Through Time',
  faces: [{
    delve: true,
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 7);
        const itens = (ids: number[]): ChoiceItem[] => ids.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } }));
        const n = Math.min(2, topo.length);
        const mao = (yield* chooseItems(c.g, c.you, 'Dig Through Time: escolha duas cartas para a mão', itens(topo), n, n)).map(Number);
        if (mao.length) yield* moveObjects(c.g, mao.map((id) => ({ id, to: 'hand' as const })), 'effect');
        const resto = topo.filter((id) => !mao.includes(id));
        // o resto vai para o fundo na ordem que você escolher (a primeira escolhida fica mais em cima)
        const ordem = resto.length > 1 ? (yield* chooseItems(c.g, c.you, 'Ordem das cartas que vão para o fundo (a primeira fica mais em cima)', itens(resto), resto.length, resto.length, true)).map(Number) : resto;
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !ordem.includes(id)), ...ordem];
        c.g.bump();
      },
    },
  }],
  rulings: {
    1: 'teste: só paga genérico e não mais que ele',
    2: 'regra geral: CR 702.66b — delve não é custo alternativo',
    3: 'regra geral: CR 702.66 — o valor de mana não muda',
  },
});
