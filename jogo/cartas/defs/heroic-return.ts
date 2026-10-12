// Heroic Return
// This spell costs {2} less to cast if a creature is attacking you.
// Return target creature card from your graveyard to the battlefield. If a Hero enters this way, it enters with two
// additional +1/+1 counters on it.
import { chars, defineCard, putOntoBattlefield, t, tgt } from '../../motor/api.ts';
import { ehHeroi } from '../vingadores.ts';

export default defineCard({
  name: 'Heroic Return',
  faces: [{
    selfCost: (c) => ((c.g.state.combat?.attackers ?? []).some((a) => !a.removed && a.target.kind === 'player' && a.target.id === c.you) ? { reduce: 2 } : {}),
    spell: {
      targets: [t.card('graveyard', (c, id) => chars(c.g, id).types.includes('Creature'), 'carta de criatura alvo no seu cemitério')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you, counters: ehHeroi(c.g, id) ? { '+1/+1': 2 } : {} }], 'effect');
      },
    },
  }],
  rulings: {},
});