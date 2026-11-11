// Stubborn Denial
// Counter target noncreature spell unless its controller pays {1}.
// Ferocious — If you control a creature with power 4 or greater, counter that spell instead.
import { counter, defineCard, isCreature, mayPay, t, tgt } from '../../motor/api.ts';
import { temFerocidade } from '../dragoes.ts';

export default defineCard({
  name: 'Stubborn Denial',
  faces: [{
    spell: {
      targets: [t.spell((c, id) => !isCreature(c.g, id), 'mágica alvo que não é de criatura')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 1: com ferocidade na resolução, só o efeito melhorado ("em vez disso")
        if (!temFerocidade(c.g, c.you)) {
          const quem = c.g.state.objects[id]?.stack?.controller;
          // CR 118.12a: "a menos que pague"
          if (quem !== undefined && !c.g.state.players[quem].left && (yield* mayPay(c, quem, '{1}', 'a mágica não ser anulada (Stubborn Denial)'))) return;
        }
        yield* counter(c.g, id);
      },
    },
  }],
  rulings: {
    1: 'teste: com ferocidade, anula sem dar a chance de pagar',
    2: 'não se aplica: o efeito de ferocidade desta carta usa "em vez disso"',
  },
});
