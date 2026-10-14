// Talrand, Sky Summoner
// Whenever you cast an instant or sorcery spell, create a 2/2 blue Drake creature token with flying.
import { createTokens, defineCard, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Talrand, Sky Summoner',
  faces: [{
    abilities: [
      // ruling 1: o gatilho resolve antes da mágica, mesmo que ela seja anulada (CR 603.3)
      triggered(on.youCast(is.instantOrSorcery), function* (c) {
        yield* createTokens(c.g, c.you, 'Drake', 1);
      }, { text: 'Sempre que você conjura uma mágica instantânea ou de feitiço, crie uma ficha de criatura Drake 2/2 azul com voar.' }),
    ],
  }],
  rulings: {
    1: 'teste: o gatilho resolve antes da mágica e a ficha fica mesmo com a mágica anulada',
  },
});
