// Mortality Spear
// This spell costs {2} less to cast if you gained life this turn.
// Destroy target nonland permanent.
import { defineCard, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Mortality Spear',
  faces: [{
    selfCost: (c) => (c.g.state.turnStats[c.you].lifeGained > 0 ? { reduce: 2 } : {}),
    spell: {
      targets: [t.nonlandPermanent()],
      *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
    },
  }],
  rulings: { 1: 'teste: com vida ganha no turno, custa {B}{G}' },
});
