// The Squadron Sinister
// Flying, haste
// Other Villains you control get +2/+2 and have flying and haste.
// Mayhem {3}{U}{R} (You may cast this card from your graveyard for {3}{U}{R} if you discarded it this turn. Timing rules
// still apply.)
import { and, anthem, defineCard, is, keywords, mayhem } from '../../motor/api.ts';

const caos = mayhem('{3}{U}{R}');

export default defineCard({
  name: 'The Squadron Sinister',
  faces: [{
    // CR 702.187b: do cemitério, pelo custo de mayhem, se foi descartada neste turno
    altCosts: [caos.altCost],
    abilities: [
      ...keywords('flying', 'haste'),
      anthem(and(is.yours, is.other, is.subtype('Villain')), () => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'haste' }], 'Os outros Villains que você controla recebem +2/+2 e têm voar e ímpeto.'),
      caos.ability,
    ],
  }],
  rulings: {},
});
