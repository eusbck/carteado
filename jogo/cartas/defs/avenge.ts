// Avenge
// This spell costs {2} less to cast if a player attacked you during their last turn.
// Destroy all creatures. You gain 1 life for each creature destroyed this way.
import { allCreatures, defineCard, destroy, gainLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Avenge',
  faces: [{
    // quem cada jogador atacou no último turno dele: state.lastTurnAttackedPlayers
    selfCost: (c) => (c.g.state.lastTurnAttackedPlayers.some((atacados, p) => p !== c.you && atacados.includes(c.you)) ? { reduce: 2 } : {}),
    spell: {
      *effect(c) {
        const ids = allCreatures(c.g);
        if (!ids.length) return;
        yield* destroy(c.g, ids);
        const destruidas = ids.filter((id) => c.g.state.objects[id]?.zone !== 'battlefield').length;
        if (destruidas > 0) gainLife(c.g, c.you, destruidas, c.source);
      },
    },
  }],
  rulings: {},
});