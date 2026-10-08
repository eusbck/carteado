// White Orchid Phantom
// Flying, first strike
// When this creature enters, destroy up to one target nonbasic land. Its controller may search their library for a
// basic land card, put it onto the battlefield tapped, then shuffle.
import { and, controllerOf, defineCard, destroy, etb, is, keywords, maySearchBasicToBattlefield, not, t, tgt, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'White Orchid Phantom',
  faces: [{
    abilities: [
      ...keywords('flying', 'first strike'),
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const dono = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        // ruling 1: busca mesmo que o terreno não seja destruído
        yield* maySearchBasicToBattlefield(c, dono, true);
      }, {
        targets: [upTo(1, t.land(and(is.land, not(is.basic)), 'até um terreno não básico alvo'))],
        text: 'Quando esta criatura entra, destrua até um terreno não básico alvo. O controlador dele pode procurar uma carta de terreno básico, colocá-la no campo virada e embaralhar.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o controlador busca mesmo que o terreno não seja destruído',
    2: 'regra geral: CR 608.2b — com o alvo ilegal, nada acontece (nem a busca)',
  },
});
