// Release to Memory
// Exile target opponent's graveyard. For each creature card exiled this way, create a 1/1 colorless Spirit creature
// token.
import { createTokens, defineCard, exile, isCreature, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Release to Memory',
  faces: [{
    spell: {
      targets: [t.opponent()],
      *effect(c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        const cartas = [...c.g.state.zones.graveyard[p]];
        if (!cartas.length) return;
        const exiladas = (yield* exile(c.g, cartas)).filter((id): id is number => id !== null && c.g.state.objects[id]?.zone === 'exile');
        const n = exiladas.filter((id) => isCreature(c.g, id)).length;
        if (n > 0) yield* createTokens(c.g, c.you, 'Spirit incolor', n);
      },
    },
  }],
  rulings: {},
});
