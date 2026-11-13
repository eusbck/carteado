// Entish Restoration
// Sacrifice a land. Search your library for up to two basic land cards, put them onto the battlefield tapped, then
// shuffle. If you control a creature with power 4 or greater, instead search for up to three.
import { controlledBy, defineCard, isCreature, isLand, power, sacrificeYours } from '../../motor/api.ts';
import { basico, buscaTerrenos } from '../terras.ts';

export default defineCard({
  name: 'Entish Restoration',
  faces: [{
    spell: {
      *effect(c) {
        yield* sacrificeYours(c, c.you, (id) => isLand(c.g, id), 1, 'um terreno');
        const n = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && power(c.g, id) >= 4).length ? 3 : 2;
        yield* buscaTerrenos(c, n, (id) => basico(c.g, id), true, `Procure até ${n} cartas de terreno básico`);
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 608.2h — confere a criatura de força 4 ou mais ao resolver' },
});
