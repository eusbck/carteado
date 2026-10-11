// Shivan Devastator
// Flying, haste
// This creature enters with X +1/+1 counters on it.
import { defineCard, entersWithCounters, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Shivan Devastator',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      // CR 107.3m: X é o valor escolhido ao conjurar; se não foi conjurada, X é 0
      entersWithCounters('+1/+1', (_c, ev) => ev.spell?.x ?? 0),
    ],
  }],
  rulings: {},
});
