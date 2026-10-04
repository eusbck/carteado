// Mana Geyser
// Add {R} for each tapped land your opponents control.
import { addMana, controllerOf, defineCard, isLand, permanentsMatching } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Mana Geyser',
  faces: [{
    spell: {
      *effect(c) {
        const n = permanentsMatching(c.g, (id) => isLand(c.g, id) && c.g.state.objects[id].tapped && c.g.isOpponent(c.you, controllerOf(c.g, id))).length;
        addMana(c.g, c.you, Array(n).fill('R') as ManaType[], { source: c.source });
      },
    },
  }],
  rulings: {},
});
