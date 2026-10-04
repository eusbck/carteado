// Toxic Deluge — As an additional cost to cast this spell, pay X life. All creatures get -X/-X until end of turn.
import { addEffect, additionalCost, allCreatures, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Toxic Deluge',
  faces: [{
    additionalCosts: [additionalCost('life', 'pagar X de vida', [{ k: 'life', n: 'X' }])],
    spell: {
      // X é escolhido ao conjurar (CR 601.2b); não pode passar da vida (CR 119.4)
      xMax: (c) => Math.max(0, c.g.state.players[c.you].life),
      *effect(c) {
        // CR 611.2c: o conjunto de criaturas afetadas é travado na resolução
        addEffect(c.g, {
          source: c.source, sourceDef: 'Toxic Deluge', controller: c.you, duration: { kind: 'endOfTurn' },
          affected: allCreatures(c.g), mods: [{ k: 'pt', p: -c.x, t: -c.x }],
        });
      },
    },
  }],
});
