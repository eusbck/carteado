// Borg Incursion
// Create two 1/1 colorless Borg artifact creature tokens, then artifact creatures you control gain protection from the
// color of your choice until end of turn.
import { chooseColor, controlledBy, createTokens, defineCard, untilEndOfTurn } from '../../motor/api.ts';
import { artefatoCriatura } from '../borg.ts';

export default defineCard({
  name: 'Borg Incursion',
  faces: [{
    spell: {
      *effect(c) {
        yield* createTokens(c.g, c.you, 'Borg', 2);
        const cor = yield* chooseColor(c.g, c.you, 'Proteção contra qual cor?');
        const ids = controlledBy(c.g, c.you, (id) => artefatoCriatura(c.g, id));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'protection', param: `color:${cor}` }]);
      },
    },
  }],
  rulings: {},
});
