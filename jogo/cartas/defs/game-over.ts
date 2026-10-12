// Game Over
// This spell costs {2} less to cast if a player's life total is less than or equal to half their starting life total.
// Destroy all creatures.
import { allCreatures, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: 'Game Over',
  faces: [{
    selfCost: (c) => (c.g.state.players.some((p) => !p.left && p.life * 2 <= c.g.state.config.startingLife) ? { reduce: 2 } : {}),
    spell: {
      *effect(c) { const ids = allCreatures(c.g); if (ids.length) yield* destroy(c.g, ids); },
    },
  }],
  rulings: {},
});