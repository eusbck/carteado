// Swords to Plowshares — Exile target creature. Its controller gains life equal to its power.
import { controllerOf, defineCard, exile, gainLife, lkiChars, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Swords to Plowshares',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const who = controllerOf(c.g, id);
        yield* exile(c.g, [id]);
        // CR 608.2h: a força vem da última informação conhecida da criatura exilada
        gainLife(c.g, who, Math.max(0, lkiChars(c.g, id)?.power ?? 0), c.source);
      },
    },
  }],
  rulings: {
    1: "teste: usa a força da criatura como estava no campo (marcadores contam)",
  },
});
