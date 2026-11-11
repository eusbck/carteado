// Borg Incursion
// Create two 1/1 colorless Borg artifact creature tokens, then artifact creatures you control gain protection from the
// color of your choice until end of turn.
import { chooseColor, controlledBy, defineCard, untilEndOfTurn } from '../../motor/api.ts';
import { criaBorg, criaturaArtefato } from '../borg.ts';

export default defineCard({
  name: 'Borg Incursion',
  faces: [{
    spell: {
      *effect(c) {
        yield* criaBorg(c, 2);
        const cor = yield* chooseColor(c.g, c.you, 'Borg Incursion: escolha a cor da proteção');
        // CR 611.2c: afeta as criaturas artefato que você controla agora, inclusive as fichas recém-criadas
        const ids = controlledBy(c.g, c.you, (id) => criaturaArtefato(c, id));
        untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'protection', param: `color:${cor}` }]);
      },
    },
  }],
  rulings: {},
});
