// Cleansing Beam
// Radiance — Cleansing Beam deals 2 damage to target creature and each other creature that shares a color with it.
import { dealDamage, defineCard, t, tgt } from '../../motor/api.ts';
import { radiancia } from '../inferno.ts';

export default defineCard({
  name: 'Cleansing Beam',
  faces: [{
    spell: {
      // ruling 5: um alvo só; sem ele, a mágica não resolve
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // rulings 1-4: as suas criaturas também; as cores são vistas na resolução; o incolor não compartilha cor
        dealDamage(c.g, radiancia(c.g, id).map((x) => ({ source: c.source, target: { kind: 'obj' as const, id: x }, amount: 2, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'teste: 2 de dano à criatura alvo e a cada outra que compartilha uma cor com ela, inclusive as suas',
    2: 'teste: 2 de dano à criatura alvo e a cada outra que compartilha uma cor com ela, inclusive as suas',
    3: 'teste: mirando uma criatura incolor, só ela leva dano',
    4: 'regra geral: CR 608.2h — as cores são vistas na resolução (cartas/inferno.ts radiancia)',
    5: 'regra geral: CR 608.2b — com o único alvo ilegal, a mágica não resolve (motor/stack.ts)',
  },
});