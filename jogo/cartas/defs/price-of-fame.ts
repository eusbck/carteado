// Price of Fame
// This spell costs {2} less to cast if it targets a legendary creature.
// Destroy target creature.
// Surveil 2.
import { defineCard, destroy, isLegendary, lookAndArrange, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Price of Fame',
  faces: [{
    // CR 601.2f: a redução depende do alvo escolhido; ruling 4: o valor de mana continua 4
    selfCost: (c, info) => ((info.targets[0] ?? []).some((r) => r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield' && isLegendary(c.g, r.id)) ? { reduce: 2 } : {}),
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        // ruling 6: indestrutível não é destruída, mas a vidência acontece
        if (id !== null) yield* destroy(c.g, [id]);
        yield* lookAndArrange(c.g, c.you, 2, 'surveil');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2c — as instruções seguem a ordem do texto (destruir, depois vigiar)',
    2: 'regra geral: CR 608.2b — sem alvo legal, a mágica não resolve e não vigia (motor/stack.ts)',
    3: 'regra geral: CR 701.25a — vigiar põe qualquer número no cemitério e o resto no topo (motor/actions.ts lookAndArrange)',
    4: 'teste: mirando uma criatura lendária custa {1}{B}',
    5: 'regra geral: CR 603.3 — os gatilhos de morrer esperam a mágica terminar (vigiar vem antes)',
    6: 'regra geral: CR 702.12b — indestrutível não é destruída; o resto da mágica acontece',
  },
});
