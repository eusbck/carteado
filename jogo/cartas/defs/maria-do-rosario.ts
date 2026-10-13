// Maria do Rosário (carta própria da mesa)
// Whenever a creature deals combat damage to you, tap it and put two stun counters on it.
import { addCounters, defineCard, isCreature, on, tap, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Maria do Rosário',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'damage' && e.combat && e.target.kind === 'player' && e.target.id === c.you ? { criatura: e.source } : false)), function* (c) {
        const id = c.event.criatura as ObjId;
        if (c.g.state.objects[id]?.zone !== 'battlefield' || !isCreature(c.g, id)) return;
        tap(c.g, id);
        addCounters(c.g, { kind: 'obj', id }, 'stun', 2, c.you);
      }, { text: 'Sempre que uma criatura causa dano de combate a você, vire-a e coloque dois marcadores de atordoamento nela.' }),
    ],
  }],
  rulings: {},
});
