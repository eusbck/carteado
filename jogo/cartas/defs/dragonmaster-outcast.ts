// Dragonmaster Outcast
// At the beginning of your upkeep, if you control six or more lands, create a 5/5 red Dragon creature token with
// flying.
import { controlledBy, createTokens, defineCard, isLand, on, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const seisTerrenos = (c: SCtx) => controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length >= 6;

export default defineCard({
  name: 'Dragonmaster Outcast',
  faces: [{
    abilities: [
      // CR 603.4: cláusula "se" interveniente — conferida ao disparar e de novo na resolução
      triggered(on.upkeep('you'), function* (c) {
        yield* createTokens(c.g, c.you, 'Dragon 5/5', 1);
      }, { condition: seisTerrenos, text: 'No início da sua manutenção, se você controlar seis ou mais terrenos, crie uma ficha de criatura Dragon vermelha 5/5 com voar.' }),
    ],
  }],
  rulings: {},
});
