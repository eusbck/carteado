// Vengeful Ancestor
// Flying
// Whenever this creature enters or attacks, goad target creature. (Until your next turn, that creature attacks each
// combat if able and attacks a player other than you if able.)
// Whenever a goaded creature attacks, it deals 1 damage to its controller.
import { controllerOf, dealDamage, defineCard, goad, keywords, on, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';
import { goadada } from '../culpa.ts';

export default defineCard({
  name: 'Vengeful Ancestor',
  faces: [{
    abilities: [
      ...keywords('flying'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        const id = tgt(c);
        if (id !== null) goad(c.g, id, c.you);
      }, { targets: [t.creature()], text: 'Sempre que esta criatura entra ou ataca, goade a criatura alvo.' }),
      // um disparo por criatura goadada que ataca; ela causa o dano ao próprio controlador
      triggered(on.custom((e, c) => (e.type === 'attackers'
        ? e.attackers.filter((a) => goadada(c.g, a.obj)).map((a) => ({ atacante: a.obj, quem: e.player }))
        : false)), function* (c) {
        const id = c.event.atacante as ObjId;
        const quem = c.g.state.objects[id]?.zone === 'battlefield' ? controllerOf(c.g, id) : c.event.quem as PlayerId;
        dealDamage(c.g, [{ source: id, target: { kind: 'player', id: quem }, amount: 1, combat: false }]);
      }, { text: 'Sempre que uma criatura goadada ataca, ela causa 1 de dano ao controlador dela.' }),
    ],
  }],
  rulings: {},
});
