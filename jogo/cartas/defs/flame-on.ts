// Flame On!
// Put X +1/+1 counters on target creature, where X is the number of noncreature, nonland cards in your graveyard. It
// gains flying until end of turn.
// Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may
// cast this card from exile without paying its mana cost.)
import { addCounters, defineCard, isCreature, isLand, rebound, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Flame On!',
  faces: [{
    // CR 702.88a
    abilities: [rebound()],
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // X é contado na resolução; a própria mágica ainda está na pilha e não conta
        const x = c.g.state.zones.graveyard[c.you].filter((carta) => !isCreature(c.g, carta) && !isLand(c.g, carta)).length;
        if (x > 0) addCounters(c.g, { kind: 'obj', id }, '+1/+1', x, c.you);
        untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'flying' }]);
      },
    },
  }],
  rulings: {},
});
