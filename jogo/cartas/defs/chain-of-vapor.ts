// Chain of Vapor
// Return target nonland permanent to its owner's hand. Then that permanent's controller may sacrifice a land of their
// choice. If the player does, they may copy this spell and may choose a new target for that copy.
import { chooseItems, controllerOf, controlledBy, copySpell, defineCard, isLand, nameOf, objItem, returnToHand, sacrifice, t, tgt, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Chain of Vapor',
  faces: [{
    spell: {
      targets: [t.nonlandPermanent()],
      *effect(c) {
        const g = c.g;
        const id = tgt(c);
        if (id === null) return;
        const quem = controllerOf(g, id);
        yield* returnToHand(g, [id]);
        if (g.state.players[quem].left) return;
        const terrenos = controlledBy(g, quem, (x) => isLand(g, x));
        if (!terrenos.length) return;
        const [esc] = yield* chooseItems(g, quem, 'Chain of Vapor: você pode sacrificar um terreno para copiar a mágica', [
          { id: 'nao', label: 'Não sacrificar' }, ...terrenos.map((x) => objItem(g, x, nameOf(g, x))),
        ], 1, 1);
        if (esc === 'nao') return;
        yield* sacrifice(g, [Number(esc)]);
        // CR 707.10: a cópia vai para a pilha sob o controle de quem sacrificou, que pode escolher o novo alvo
        if (yield* yesNo(g, quem, 'Chain of Vapor: copiar a mágica?', 'Copiar', 'Não copiar')) yield* copySpell(g, c.self, quem, { newTargets: true });
      },
    },
  }],
  rulings: {},
});
