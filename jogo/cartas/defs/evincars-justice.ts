// Evincar's Justice
// Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it
// resolves.)
// Evincar's Justice deals 2 damage to each creature and each player.
import { allCreatures, buyback, dealDamage, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: "Evincar's Justice",
  faces: [{
    // CR 702.27a: pago, a carta vai para a mão do dono ao resolver (motor/stack.ts)
    additionalCosts: [buyback('{3}')],
    spell: {
      *effect(c) {
        dealDamage(c.g, [
          ...allCreatures(c.g).map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 2, combat: false })),
          ...c.g.playersInGame().map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 2, combat: false })),
        ]);
      },
    },
  }],
  rulings: {},
});
