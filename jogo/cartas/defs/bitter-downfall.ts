// Bitter Downfall
// This spell costs {3} less to cast if it targets a creature that was dealt damage this turn.
// Destroy target creature. Its controller loses 2 life.
import { controllerOf, defineCard, destroy, loseLife, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Bitter Downfall',
  faces: [{
    // a redução depende do alvo escolhido (CR 601.2f): criatura com dano marcado neste turno. Ao conjurar há um alvo só;
    // na estimativa de "dá para conjurar?" o motor passa os alvos possíveis, e basta um deles servir
    selfCost: (c, info) => ((info.targets[0] ?? []).some((r) => r.kind === 'obj' && (c.g.state.objects[r.id]?.damage ?? 0) > 0) ? { reduce: 3 } : {}),
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const quem = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        loseLife(c.g, quem, 2, c.source);
      },
    },
  }],
  rulings: {},
});
