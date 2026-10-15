// Prisoner's Dilemma
// Each opponent secretly chooses silence or snitch, then the choices are revealed. If each opponent chose silence,
// Prisoner's Dilemma deals 4 damage to each of them. If each opponent chose snitch, Prisoner's Dilemma deals 8 damage to
// each of them. Otherwise, Prisoner's Dilemma deals 12 damage to each opponent who chose silence.
// Flashback {5}{R}{R}
import { chooseOne, dealDamage, defineCard, flashback } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: "Prisoner's Dilemma",
  faces: [{
    altCosts: [flashback('{5}{R}{R}')],
    spell: {
      *effect(c) {
        // cada oponente escolhe na sua vez, sem ver as outras escolhas (o registro só mostra depois de todos)
        const escolhas = new Map<PlayerId, string>();
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x) && !c.g.state.players[x].left)) {
          escolhas.set(p, yield* chooseOne(c.g, p, "Prisoner's Dilemma: escolha em segredo", [{ id: 'silencio', label: 'Silêncio' }, { id: 'delatar', label: 'Delatar' }], { secret: true }));
        }
        if (!escolhas.size) return;
        c.g.log(`Prisoner's Dilemma: ${[...escolhas].map(([p, e]) => `${c.g.state.players[p].name} escolheu ${e === 'silencio' ? 'silêncio' : 'delatar'}`).join('; ')}.`);
        const todos = [...escolhas.values()];
        const ops = [...escolhas.keys()];
        let reqs: { p: PlayerId; n: number }[];
        if (todos.every((e) => e === 'silencio')) reqs = ops.map((p) => ({ p, n: 4 }));
        else if (todos.every((e) => e === 'delatar')) reqs = ops.map((p) => ({ p, n: 8 }));
        else reqs = ops.filter((p) => escolhas.get(p) === 'silencio').map((p) => ({ p, n: 12 }));
        dealDamage(c.g, reqs.map(({ p, n }) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: n, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'teste: as escolhas são feitas na resolução: todos em silêncio levam 4; todos delatando, 8; misturado, só quem ficou em silêncio leva 12',
  },
});
