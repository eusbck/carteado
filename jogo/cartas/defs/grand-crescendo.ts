// Grand Crescendo
// Create X 1/1 green and white Citizen creature tokens. Creatures you control gain indestructible until end of turn.
import { createTokens, creaturesOf, defineCard, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Grand Crescendo',
  faces: [{
    spell: {
      *effect(c) {
        yield* createTokens(c.g, c.you, 'Citizen', c.x);
        // CR 611.2c: só as criaturas que você controla agora (inclusive as fichas novas)
        untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'addKeyword', kw: 'indestructible' }]);
      },
    },
  }],
  rulings: {},
});
