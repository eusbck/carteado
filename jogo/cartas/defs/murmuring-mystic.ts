// Murmuring Mystic
// Whenever you cast an instant or sorcery spell, create a 1/1 blue Bird Illusion creature token with flying.
import { createTokens, defineCard, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Murmuring Mystic',
  faces: [{
    abilities: [
      // ruling 1: o gatilho resolve antes da mágica, mesmo que ela seja anulada (CR 603.3)
      triggered(on.youCast(is.instantOrSorcery), function* (c) {
        yield* createTokens(c.g, c.you, 'Bird Illusion', 1);
      }, { text: 'Sempre que você conjura uma mágica instantânea ou de feitiço, crie uma ficha de criatura Bird Illusion 1/1 azul com voar.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjurando uma instantânea, o gatilho resolve antes dela e cria o Bird Illusion',
  },
});
