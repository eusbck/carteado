// Abomination, World Ravager
// Menace, trample
// Mayhem {4}{R} (You may cast this card from your graveyard for {4}{R} if you discarded it this turn. Timing rules still
// apply.)
import { defineCard, keywords, mayhem } from '../../motor/api.ts';

const caos = mayhem('{4}{R}');

export default defineCard({
  name: 'Abomination, World Ravager',
  faces: [{
    // CR 702.187b: do cemitério, pelo custo de mayhem, se foi descartada neste turno
    altCosts: [caos.altCost],
    abilities: [...keywords('menace', 'trample'), caos.ability],
  }],
  rulings: {},
});
