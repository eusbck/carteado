// Assassin's Trophy
// Destroy target permanent an opponent controls. Its controller may search their library for a basic land card,
// put it onto the battlefield, then shuffle.
import { controllerOf, defineCard, destroy, is, maySearchBasicToBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Assassin's Trophy",
  faces: [{
    spell: {
      targets: [t.permanent(is.opponents, 'permanente alvo que um oponente controla')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const who = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        yield* maySearchBasicToBattlefield(c, who, false);
      },
    },
  }],
  rulings: {
    1: 'teste: sem procurar, o grimório não é embaralhado',
    2: 'teste: alvo indestrutível não é destruído, mas o controlador pode procurar',
    3: 'regra geral: CR 608.2b — alvo ilegal, a mágica não resolve e ninguém procura',
    4: 'regra geral: CR 608.2b — alvo ilegal, a mágica não resolve e ninguém procura',
    5: 'teste: alvo indestrutível não é destruído, mas o controlador pode procurar',
    6: 'teste: sem procurar, o grimório não é embaralhado',
  },
});
