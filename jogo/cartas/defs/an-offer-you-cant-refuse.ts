// An Offer You Can't Refuse
// Counter target noncreature spell. Its controller creates two Treasure tokens.
import { controllerOf, counter, createTokens, defineCard, is, not, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "An Offer You Can't Refuse",
  faces: [{
    spell: {
      targets: [t.spell(not(is.creature), 'mágica alvo que não seja de criatura')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return; // ruling 1
        const dono = controllerOf(c.g, id);
        yield* counter(c.g, id);
        yield* createTokens(c.g, dono, 'Treasure', 2); // ruling 2: mesmo se não puder ser anulada
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — alvo ilegal: não resolve e não há Treasures (motor/stack.ts)',
    2: 'teste: anula a mágica e o controlador dela cria dois Treasures',
  },
});
