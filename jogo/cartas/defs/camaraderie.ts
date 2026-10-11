// Camaraderie
// You gain X life and draw X cards, where X is the number of creatures you control. Creatures you control get +1/+1
// until end of turn.
import { creaturesOf, defineCard, draw, gainLife, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Camaraderie',
  faces: [{
    spell: {
      *effect(c) {
        const x = creaturesOf(c.g, c.you).length;
        if (x) { gainLife(c.g, c.you, x, c.source); yield* draw(c.g, c.you, x); }
        // ruling 1: só as criaturas que você controla na resolução
        const ids = creaturesOf(c.g, c.you);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: 1, t: 1 }]);
      },
    },
  }],
  rulings: {
    1: 'teste: ganha X de vida, compra X cartas e as suas criaturas recebem +1/+1 até o fim do turno',
  },
});