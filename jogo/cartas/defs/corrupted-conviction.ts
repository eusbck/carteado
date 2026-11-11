// Corrupted Conviction
// As an additional cost to cast this spell, sacrifice a creature.
// Draw two cards.
import { defineCard, draw, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Corrupted Conviction',
  faces: [{
    additionalCosts: [{ key: 'sacrificar', label: 'sacrificar uma criatura', optional: false, parts: [{ k: 'sacrifice', n: 1, filter: (c, id) => isCreature(c.g, id), label: 'uma criatura' }] }],
    spell: { *effect(c) { yield* draw(c.g, c.you, 2); } },
  }],
  rulings: {
    1: 'regra geral: CR 601.2h — sem criatura para sacrificar, não dá para conjurar',
    2: 'regra geral: CR 601.2h — a criatura vai embora mesmo se a mágica for anulada',
  },
});
