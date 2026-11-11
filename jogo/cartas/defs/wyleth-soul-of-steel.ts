// Wyleth, Soul of Steel
// Trample
// Whenever Wyleth attacks, draw a card for each Aura and Equipment attached to it.
import { chars, defineCard, draw, keyword, on, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

function anexos(g: G, id: ObjId): number {
  const s = g.state;
  return s.zones.battlefield.filter((x) => s.objects[x].attachedTo === id && chars(g, x).subtypes.some((t) => t === 'Aura' || t === 'Equipment')).length;
}

export default defineCard({
  name: 'Wyleth, Soul of Steel',
  faces: [{
    abilities: [
      keyword('trample'),
      // ruling 1: conta na resolução; se Wyleth saiu do campo, vale a contagem de quando ele atacou (a última que o
      // motor guarda dele com os anexos)
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source) ? { anexos: anexos(c.g, c.source) } : false)), function* (c) {
        const n = c.g.state.objects[c.source]?.zone === 'battlefield' ? anexos(c.g, c.source) : Number(c.event.anexos ?? 0);
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Sempre que Wyleth ataca, compre uma carta para cada Aura e Equipamento anexado a ele.' }),
    ],
  }],
  rulings: {
    1: 'teste: conta as Auras e os Equipamentos anexados na resolução',
  },
});
