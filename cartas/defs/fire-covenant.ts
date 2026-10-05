// Fire Covenant
// As an additional cost to cast this spell, pay X life.
// Fire Covenant deals X damage divided as you choose among any number of target creatures.
import { additionalCost, dealDamage, defineCard, t, tgtRef } from '../../motor/api.ts';

export default defineCard({
  name: 'Fire Covenant',
  faces: [{
    additionalCosts: [additionalCost('life', 'pagar X de vida', [{ k: 'life', n: 'X' }])],
    spell: {
      xMax: (c) => Math.max(0, c.g.state.players[c.you].life),
      // ruling 1: com X = 0, nenhum alvo; ruling 2: pelo menos 1 de dano por alvo
      targets: [{ ...t.creature(undefined, 'criaturas alvo do dano dividido'), min: 0, max: (c) => c.x ?? 0 }],
      divide: (c) => c.x,
      *effect(c) {
        const div = c.division?.[0] ?? [];
        const golpes = (c.targets[0] ?? []).map((_, i) => ({ r: tgtRef(c, 0, i), n: div[i] ?? 0 })).filter((x) => x.r !== null && x.n > 0);
        // ruling 3: a divisão não muda se algum alvo ficar ilegal
        if (golpes.length) dealDamage(c.g, golpes.map((x) => ({ source: c.source, target: x.r!, amount: x.n, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'regra geral: com X = 0, o máximo de alvos é 0',
    2: 'teste: pelo menos 1 de dano por alvo',
    3: 'regra geral: CR 601.2d — a divisão é fixada ao conjurar',
  },
});
