// Path to Exile
// Exile target creature. Its controller may search their library for a basic land card, put that card onto
// the battlefield tapped, then shuffle.
import { controllerOf, defineCard, exile, maySearchBasicToBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Path to Exile',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const who = controllerOf(c.g, id);
        yield* exile(c.g, [id]);
        yield* maySearchBasicToBattlefield(c, who, true);
      },
    },
  }],
  rulings: {
    1: 'teste: o controlador pode não procurar (e então não embaralha)',
    2: 'regra geral: CR 608.2b (alvo ilegal, nada acontece; testes/cenarios Q21)',
  },
});
