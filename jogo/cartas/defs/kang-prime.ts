// Kang Prime
// Flying
// Whenever Kang Prime enters or attacks, exile cards from the top of your library until you exile a nonland card. Put two
// time counters on that card. If it doesn't have suspend, it gains suspend. (At the beginning of your upkeep, remove a
// time counter. When the last is removed, you may cast it without paying its mana cost. If it's a creature, it has
// haste.)
import { addCounters, defineCard, exile, grantSuspend, isLand, keyword, on, triggered } from '../../motor/api.ts';
import type { EffectFn } from '../../motor/defs.ts';

const exila: EffectFn = function* (c) {
  const s = c.g.state;
  // uma a uma, do topo, até sair uma carta que não é terreno; os terrenos ficam exilados
  while (s.zones.library[c.you].length) {
    const [ex] = yield* exile(c.g, [s.zones.library[c.you][0]]);
    if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') break;
    if (isLand(c.g, ex)) continue;
    addCounters(c.g, { kind: 'obj', id: ex }, 'time', 2, c.you);
    // CR 702.62: ganha suspender se ainda não tem
    grantSuspend(c.g, c.source, c.you, [ex]);
    break;
  }
};
const TEXTO = 'Sempre que Kang Prime entra ou ataca, exile cartas do topo do seu grimório até exilar uma carta que não é terreno. Coloque dois marcadores de tempo nela. Se ela não tem suspender, ganha suspender.';

export default defineCard({
  name: 'Kang Prime',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfEnters(), exila, { text: TEXTO }),
      triggered(on.selfAttacks(), exila, { text: TEXTO }),
    ],
  }],
  rulings: {},
});
