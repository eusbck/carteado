// Deadly Dispute
// As an additional cost to cast this spell, sacrifice an artifact or creature.
// Draw two cards and create a Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add one mana of any
// color.")
import { additionalCost, cost, createTokens, defineCard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Deadly Dispute',
  faces: [{
    additionalCosts: [additionalCost('sacrificio', 'sacrifique um artefato ou uma criatura', cost('Sacrifice an artifact or creature'))],
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 2);
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      },
    },
  }],
  rulings: {},
});
