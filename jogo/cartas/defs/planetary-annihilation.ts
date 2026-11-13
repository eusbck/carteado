// Planetary Annihilation
// Each player chooses six lands they control, then sacrifices the rest. Planetary Annihilation deals 6 damage to each
// creature.
import { allCreatures, chooseItems, controlledBy, dealDamage, defineCard, isLand, nameOf, objItem, sacrifice } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Planetary Annihilation',
  faces: [{
    spell: {
      *effect(c) {
        // CR 101.4: escolhas em ordem APNAP; depois todos sacrificam ao mesmo tempo (CR 608.2c)
        const sacrificar: ObjId[] = [];
        for (const p of c.g.apnap()) {
          const meus = controlledBy(c.g, p, (id) => isLand(c.g, id));
          if (meus.length <= 6) continue;
          const ficam = (yield* chooseItems(c.g, p, 'Planetary Annihilation: escolha os seis terrenos que ficam', meus.map((id) => objItem(c.g, id, nameOf(c.g, id))), 6, 6)).map(Number);
          sacrificar.push(...meus.filter((id) => !ficam.includes(id)));
        }
        if (sacrificar.length) yield* sacrifice(c.g, sacrificar);
        const criaturas = allCreatures(c.g);
        if (criaturas.length) dealDamage(c.g, criaturas.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 6, combat: false })));
      },
    },
  }],
  rulings: {},
});
