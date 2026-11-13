// Harrow
// As an additional cost to cast this spell, sacrifice a land.
// Search your library for up to two basic land cards, put them onto the battlefield, then shuffle.
import { additionalCost, defineCard, fetchBasicToBattlefield, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Harrow',
  faces: [{
    // ruling 2: o sacrifício é custo, uma vez só
    additionalCosts: [additionalCost('sacrificar', 'sacrificar um terreno', [{ k: 'sacrifice', n: 1, filter: is.land, label: 'um terreno' }])],
    spell: {
      *effect(c) {
        // ruling 1: postos no campo, não jogados (CR 305.4)
        yield* fetchBasicToBattlefield(c, 2, { tapped: false, prompt: 'Harrow: procure até duas cartas de terreno básico' });
      },
    },
  }],
  rulings: {
    1: 'teste: os dois terrenos entram desvirados e você ainda pode jogar um terreno',
    2: 'teste: sacrifica um terreno ao conjurar',
  },
});
