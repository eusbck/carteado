// Kulrath Knight
// Flying
// Wither (This deals damage to creatures in the form of -1/-1 counters.)
// Creatures your opponents control with counters on them can't attack or block.
import { controllerOf, defineCard, keywords, staticAbility } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import type { SCtx } from '../../motor/defs.ts';

// ruling 1: qualquer tipo de marcador
const presa = (c: SCtx, id: ObjId): boolean => c.g.isOpponent(c.you, controllerOf(c.g, id)) && Object.values(c.g.state.objects[id]?.counters ?? {}).some((n) => n > 0);

export default defineCard({
  name: 'Kulrath Knight',
  faces: [{
    abilities: [
      ...keywords('flying', 'wither'),
      staticAbility({
        rules: { canAttack: (c, a) => !presa(c, a), canBlock: (c, b) => !presa(c, b) },
        text: 'As criaturas que seus oponentes controlam com marcadores não podem atacar nem bloquear.',
      }),
    ],
  }],
  rulings: { 1: 'teste: qualquer tipo de marcador impede' },
});
