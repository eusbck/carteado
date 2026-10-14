// Swarmyard Massacre
// Create two 1/1 green Squirrel creature tokens. Then each creature that isn't an Insect, Rat, Spider, or Squirrel gets
// -1/-1 until end of turn for each creature you control that's an Insect, Rat, Spider, or Squirrel.
import { allCreatures, chars, controlledBy, createTokens, defineCard, isCreature, untilEndOfTurn } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';

const TIPOS = ['Insect', 'Rat', 'Spider', 'Squirrel'];
const doEnxame = (g: G, id: number): boolean => chars(g, id).subtypes.some((s) => TIPOS.includes(s));

export default defineCard({
  name: 'Swarmyard Massacre',
  faces: [{
    spell: {
      *effect(c) {
        yield* createTokens(c.g, c.you, 'Squirrel', 2);
        // ruling 1: uma criatura com mais de um desses tipos conta uma vez
        const x = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && doEnxame(c.g, id)).length;
        if (x > 0) untilEndOfTurn(c, allCreatures(c.g).filter((id) => !doEnxame(c.g, id)), [{ k: 'pt', p: -x, t: -x }]);
      },
    },
  }],
  rulings: {
    1: 'teste: com um Rat e os dois Squirrels novos, as outras criaturas recebem -3/-3',
  },
});
