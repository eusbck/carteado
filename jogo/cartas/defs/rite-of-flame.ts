// Rite of Flame
// Add {R}{R}, then add {R} for each card named Rite of Flame in each graveyard.
import { addMana, defineCard, nameOf } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Rite of Flame',
  faces: [{
    spell: {
      *effect(c) {
        // a própria mágica ainda está na pilha ao resolver: não se conta (CR 608.2)
        const n = c.g.state.zones.graveyard.flat().filter((id) => nameOf(c.g, id) === 'Rite of Flame').length;
        addMana(c.g, c.you, Array(2 + n).fill('R') as ManaType[], { source: c.source });
      },
    },
  }],
  rulings: {},
});
