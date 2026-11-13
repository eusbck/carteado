// Assimilate the Wounded
// For each opponent, assimilate up to one target creature card from that player's graveyard that was put there from the
// battlefield this turn. (Put it onto the battlefield under your control with a +1/+1 counter. It's a Borg artifact
// creature and loses all other creature types.)
import { assimilateCard, chars, defineCard, t, tgtsAll } from '../../motor/api.ts';
import type { TargetSpec } from '../../motor/defs.ts';

// até uma carta por oponente, do cemitério dele, que foi para lá vinda do campo neste turno
const ALVO: TargetSpec = {
  ...t.card('graveyard', (c, id) => {
    const o = c.g.state.objects[id];
    return !!o && o.card !== null && chars(c.g, id).types.includes('Creature') && (c.g.state.turnStats[o.owner]?.toGraveyardFromBattlefield ?? []).includes(o.card);
  }, 'carta de criatura alvo do cemitério de um oponente que foi para lá vinda do campo neste turno', 'opponent'),
  min: 0, max: (c) => c.g.opponents(c.you).length,
  validateSet: (c, escolhidos) => {
    const donos = escolhidos.map((r) => (r.kind === 'obj' ? c.g.state.objects[r.id]?.owner ?? -1 : -1));
    return new Set(donos).size === donos.length;
  },
};

export default defineCard({
  name: 'Assimilate the Wounded',
  faces: [{
    spell: {
      targets: [ALVO],
      *effect(c) {
        for (const id of tgtsAll(c)) yield* assimilateCard(c.g, c.you, id, c.source, 'Assimilate the Wounded');
      },
    },
  }],
  rulings: {},
});
