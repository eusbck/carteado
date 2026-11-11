// Planetary Annihilation
// Each player chooses six lands they control, then sacrifices the rest. Planetary Annihilation deals 6 damage to each
// creature.
import { allCreatures, chooseItems, dealDamage, defineCard, nameOf, objItem, sacrifice } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { terrenosDe } from '../terras.ts';

export default defineCard({
  name: 'Planetary Annihilation',
  faces: [{
    spell: {
      *effect(c) {
        const sai: ObjId[] = [];
        for (const p of c.g.apnap()) {
          const terras = terrenosDe(c.g, p);
          if (terras.length <= 6) continue;
          const fica = (yield* chooseItems(c.g, p, 'Planetary Annihilation: escolha seis terrenos para manter', terras.map((x) => objItem(c.g, x, nameOf(c.g, x))), 6, 6)).map(Number);
          sai.push(...terras.filter((x) => !fica.includes(x)));
        }
        if (sai.length) yield* sacrifice(c.g, sai);
        const cr = allCreatures(c.g);
        if (cr.length) dealDamage(c.g, cr.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 6, combat: false })));
      },
    },
  }],
  rulings: {},
});
