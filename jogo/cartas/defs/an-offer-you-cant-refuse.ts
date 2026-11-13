// An Offer You Can't Refuse
// Counter target noncreature spell. Its controller creates two Treasure tokens. (They're artifacts with "{T}, Sacrifice
// this token: Add one mana of any color.")
import { counter, createTokens, defineCard, is, not, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "An Offer You Can't Refuse",
  faces: [{
    spell: {
      targets: [t.spell(not(is.creature), 'mágica alvo que não seja de criatura')],
      *effect(c) {
        const id = tgt(c);
        // ruling 1: com o alvo ilegal, a mágica não resolve e ninguém cria Tesouros
        if (id === null) return;
        const quem = c.g.state.objects[id].stack?.controller ?? c.g.state.objects[id].controller;
        yield* counter(c.g, id);
        // ruling 2: mesmo que a mágica não possa ser anulada, quem a controla cria os Tesouros
        yield* createTokens(c.g, quem, 'Treasure', 2);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — com o único alvo ilegal, a mágica não resolve',
    2: 'teste: anula a mágica que não é de criatura e quem a controla cria dois Tesouros',
  },
});
