// Swift Demise
// Swift Demise deals 1 damage to target creature. Then destroy each creature you don't control that was dealt damage
// this turn.
import { allCreatures, controllerOf, dealDamage, defineCard, destroy, t, tgt } from '../../motor/api.ts';
import { recebeuDanoNoTurno } from '../tartarugas.ts';

export default defineCard({
  name: 'Swift Demise',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        const feridas = new Set<number>();
        if (id !== null) {
          const antes = c.g.state.objects[id].damage;
          dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 1, combat: false }]);
          if ((c.g.state.objects[id]?.damage ?? 0) > antes) feridas.add(id);
        }
        const ids = allCreatures(c.g).filter((x) => controllerOf(c.g, x) !== c.you && (feridas.has(x) || recebeuDanoNoTurno(c.g, x)));
        if (ids.length) yield* destroy(c.g, ids);
      },
    },
  }],
  rulings: {},
});