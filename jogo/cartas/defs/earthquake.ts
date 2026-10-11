// Earthquake
// Earthquake deals X damage to each creature without flying and each player.
import { allCreatures, dealDamage, defineCard, hasKw } from '../../motor/api.ts';

export default defineCard({
  name: 'Earthquake',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: quem está sem voar é visto na resolução
        dealDamage(c.g, [
          ...allCreatures(c.g).filter((id) => !hasKw(c.g, id, 'flying')).map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: c.x, combat: false })),
          ...c.g.playersInGame().map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: c.x, combat: false })),
        ]);
      },
    },
  }],
  rulings: {
    1: 'teste: X de dano a cada criatura sem voar e a cada jogador',
  },
});