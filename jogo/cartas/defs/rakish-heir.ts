// Rakish Heir
// Whenever a Vampire you control deals combat damage to a player, put a +1/+1 counter on it.
import { addCounters, controllerOf, defineCard, isSubtype, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Rakish Heir',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'damage' && e.combat && e.target.kind === 'player' && !!c.g.state.objects[e.source]
        && controllerOf(c.g, e.source) === c.you && isSubtype(c.g, e.source, 'Vampire') ? { vampiro: e.source } : false)), function* (c) {
        const id = c.event.vampiro as ObjId;
        if (c.g.state.objects[id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que um Vampire que você controla causa dano de combate a um jogador, coloque um marcador +1/+1 nele.' }),
    ],
  }],
  rulings: {},
});
