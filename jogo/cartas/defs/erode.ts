// Erode
// Destroy target creature or planeswalker. Its controller may search their library for a basic land card,
// put it onto the battlefield tapped, then shuffle.
import { controllerOf, defineCard, destroy, maySearchBasicToBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Erode',
  faces: [{
    spell: {
      targets: [t.creatureOrPlaneswalker()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const controlador = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        yield* maySearchBasicToBattlefield(c, controlador, true);
      },
    },
  }],
  rulings: {
    1: 'teste: CR 608.2b: com o alvo ilegal, ninguém procura nem embaralha',
  },
});
