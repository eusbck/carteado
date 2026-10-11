// A Little Chat
// Casualty 1 (As you cast this spell, you may sacrifice a creature with power 1 or greater. When you do, copy this
// spell.)
// Look at the top two cards of your library. Put one of them into your hand and the other on the bottom of your library.
import { casualty, chooseItems, defineCard, moveObjects, nameOf, objItem } from '../../motor/api.ts';

const baixa = casualty(1);

export default defineCard({
  name: 'A Little Chat',
  faces: [{
    // CR 702.153a: custo adicional opcional de sacrificar + gatilho de conjuração que copia a mágica
    additionalCosts: [baixa.cost],
    abilities: [baixa.trigger],
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 2);
        if (!topo.length) return;
        // ruling 1: com uma carta só no grimório, ela vai para a mão
        const [esc] = topo.length === 1 ? [String(topo[0])] : yield* chooseItems(c.g, c.you, 'A Little Chat: escolha a carta que vai para a sua mão (a outra vai para o fundo do grimório)', topo.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), card: { def: s.objects[id].def } })), 1, 1);
        const paraMao = Number(esc);
        yield* moveObjects(c.g, [{ id: paraMao, to: 'hand' }], 'effect');
        const resto = topo.filter((id) => id !== paraMao && s.objects[id]?.zone === 'library');
        if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: com uma carta só no grimório, ela vai para a mão',
    2: 'teste: CR 702.153a: com a baixa paga, a cópia resolve primeiro e as duas mágicas olham o grimório',
    3: 'regra geral: CR 702.153a — só uma criatura é sacrificada e a mágica é copiada uma vez (motor/conjurar-alternativo.ts casualty)',
    4: 'teste: CR 702.153a: com a baixa paga, a cópia resolve primeiro e as duas mágicas olham o grimório',
    5: 'regra geral: CR 707.10 — a cópia não é conjurada (motor/stack.ts copySpell)',
  },
});
