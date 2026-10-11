// Rootborn Defenses
// Populate. Creatures you control gain indestructible until end of turn. (To populate, create a token that's a copy of a
// creature token you control.)
import { creaturesOf, defineCard, populate, untilEndOfTurn } from '../../motor/api.ts';
import { POPULAR } from '../miku.ts';

export default defineCard({
  name: 'Rootborn Defenses',
  faces: [{
    spell: {
      *effect(c) {
        yield* populate(c.g, c.you);
        // ruling 7: vale para as criaturas que você controla depois de popular (a ficha nova também), não para as que vierem depois
        const ids = creaturesOf(c.g, c.you);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'indestructible' }]);
      },
    },
  }],
  rulings: {
    1: POPULAR.copia,
    2: POPULAR.naoMira,
    3: POPULAR.copiaDeCopia,
    4: POPULAR.semFicha,
    5: POPULAR.semEstado,
    6: POPULAR.entrar,
    7: 'teste: popula e as criaturas que você controla, inclusive a ficha nova, ganham indestrutível até o fim do turno',
  },
});