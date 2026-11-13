// Entish Restoration
// Sacrifice a land. Search your library for up to two basic land cards, put them onto the battlefield tapped, then
// shuffle. If you control a creature with power 4 or greater, instead search your library for up to three basic land
// cards, put them onto the battlefield tapped, then shuffle.
import { chooseItems, controlledBy, defineCard, fetchBasicToBattlefield, isCreature, isLand, nameOf, objItem, power, sacrifice } from '../../motor/api.ts';

export default defineCard({
  name: 'Entish Restoration',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: sacrificar faz parte da resolução, não é custo
        const terrenos = controlledBy(c.g, c.you, (id) => isLand(c.g, id));
        if (terrenos.length) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Entish Restoration: sacrifique um terreno', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          yield* sacrifice(c.g, [Number(esc)]);
        }
        // a criatura de força 4 é vista na hora de procurar
        const grande = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && (power(c.g, id) ?? 0) >= 4).length > 0;
        const n = grande ? 3 : 2;
        yield* fetchBasicToBattlefield(c, n, { tapped: true, prompt: `Entish Restoration: procure até ${n} cartas de terreno básico` });
      },
    },
  }],
  rulings: { 1: 'teste: sacrifica um terreno na resolução e busca dois básicos virados' },
});
