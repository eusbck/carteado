// Skullclamp
// Equipped creature gets +1/-1.
// Whenever equipped creature dies, draw two cards.
// Equip {1}
import { attachedGets, defineCard, draw, equip, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Skullclamp',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 1, t: -1 }], 'A criatura equipada recebe +1/-1.'),
      // CR 603.10a: olha para trás — a criatura que morreu estava equipada com este Equipamento
      triggered(on.dies((c, _l, o) => c.obj.attachedTo === o.id), function* (c) {
        yield* draw(c.g, c.you, 2);
      }, { text: 'Sempre que a criatura equipada morre, compre duas cartas.' }),
      equip('{1}'),
    ],
  }],
  rulings: {},
});
