// Sulfurous Blast
// Sulfurous Blast deals 2 damage to each creature and each player. If you cast this spell during your main phase,
// Sulfurous Blast deals 3 damage to each creature and each player instead.
import { allCreatures, dealDamage, defineCard } from '../../motor/api.ts';
import { conjuradaNaSuaFasePrincipal } from '../inferno.ts';

export default defineCard({
  name: 'Sulfurous Blast',
  faces: [{
    spell: {
      *effect(c) {
        const n = conjuradaNaSuaFasePrincipal(c) ? 3 : 2;
        dealDamage(c.g, [
          ...allCreatures(c.g).map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: n, combat: false })),
          ...c.g.playersInGame().map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: n, combat: false })),
        ]);
      },
    },
  }],
  rulings: {},
});