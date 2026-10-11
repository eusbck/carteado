// Subjugate the Hobbits
// Gain control of each noncommander creature with mana value 3 or less.
import { allCreatures, defineCard, gainControl, manaValue } from '../../motor/api.ts';

export default defineCard({
  name: 'Subjugate the Hobbits',
  faces: [{
    spell: {
      *effect(c) {
        // sem prazo; só as criaturas que estão no campo na resolução (CR 611.2c)
        for (const id of allCreatures(c.g)) {
          const o = c.g.state.objects[id];
          const comandante = o.card !== null && !!c.g.state.cards[o.card]?.isCommander;
          if (!comandante && manaValue(c.g, id) <= 3) gainControl(c.g, id, c.you, { kind: 'permanent' }, c.source);
        }
      },
    },
  }],
  rulings: {},
});
