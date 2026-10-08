// Soul Immolation
// As an additional cost to cast this spell, blight X. X can't be greater than the greatest toughness among creatures you
// control.
// Soul Immolation deals X damage to each opponent and each creature they control.
import { additionalCost, creaturesOf, dealDamage, defineCard, toughness } from '../../motor/api.ts';

export default defineCard({
  name: 'Soul Immolation',
  faces: [{
    // rulings 1-6: blight X é custo (CR 701.68); todos os marcadores numa criatura sua
    additionalCosts: [additionalCost('blight', 'blight X', [{ k: 'blight', n: 'X' }])],
    spell: {
      xMax: (c) => Math.max(0, ...creaturesOf(c.g, c.you).map((id) => toughness(c.g, id))),
      *effect(c) {
        if (c.x <= 0) return;
        const opps = c.g.opponents(c.you);
        dealDamage(c.g, [
          ...opps.map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: c.x, combat: false })),
          ...opps.flatMap((p) => creaturesOf(c.g, p)).map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: c.x, combat: false })),
        ]);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.2h — os custos são pagos sem que oponentes possam responder',
    2: 'regra geral: CR 701.68 — a criatura não precisa sobreviver',
    3: 'regra geral: CR 704.5q — +1/+1 e -1/-1 se anulam',
    4: 'regra geral: CR 704.5q — marcadores vistos ao morrer',
    5: 'teste: sem criatura, não pode ser conjurada',
    6: 'regra geral: CR 701.68 — todos os marcadores numa só criatura',
  },
});
