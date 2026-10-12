// Continue?
// Choose up to four target creature cards in your graveyard that were put there from the battlefield this turn. Return
// them to the battlefield.
import { chars, defineCard, putOntoBattlefield, t, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Continue?',
  faces: [{
    spell: {
      targets: [upTo(4, t.card('graveyard', (c, id) => {
        const o = c.g.state.objects[id];
        return !!o && o.card !== null && chars(c.g, id).types.includes('Creature') && (c.g.state.turnStats[c.you].toGraveyardFromBattlefield ?? []).includes(o.card);
      }, 'carta de criatura alvo no seu cemitério que veio do campo neste turno'))],
      *effect(c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'graveyard' ? [r.id] : []));
        if (ids.length) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you })), 'effect');
      },
    },
  }],
  rulings: {},
});