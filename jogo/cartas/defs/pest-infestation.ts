// Pest Infestation
// Destroy up to X target artifacts and/or enchantments. Create twice X 1/1 black and green Pest creature tokens with
// "When this token dies, you gain 1 life."
import { createTokens, defineCard, destroy, is, or, t, tgtsAll } from '../../motor/api.ts';

export default defineCard({
  name: 'Pest Infestation',
  faces: [{
    spell: {
      targets: [{ ...t.permanent(or(is.artifact, is.enchantment), 'até X artefatos e/ou encantamentos alvo'), min: 0, max: (c) => c.x ?? 0 }],
      *effect(c) {
        yield* destroy(c.g, tgtsAll(c, 0));
        // ruling 2: sempre o dobro de X
        yield* createTokens(c.g, c.you, 'Pest', 2 * c.x);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — com alvos escolhidos e todos ilegais, nada acontece',
    2: 'teste: cria o dobro de X fichas, quantos alvos forem destruídos',
  },
});
