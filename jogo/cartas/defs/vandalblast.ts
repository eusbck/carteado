// Vandalblast
// Destroy target artifact you don't control.
// Overload {4}{R} (You may cast this spell for its overload cost. If you do, change "target" in its text to "each.")
import { controllerOf, defineCard, destroy, isType, overload, overloaded, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Vandalblast',
  faces: [{
    // CR 702.96a-b: pago o custo de sobrecarga, "alvo" vira "cada" e a mágica não tem alvos
    altCosts: [overload('{4}{R}')],
    spell: {
      targets: [t.artifact((c, id) => controllerOf(c.g, id) !== c.you, 'artefato alvo que você não controla')],
      *effect(c) {
        if (overloaded(c)) {
          const s = c.g.state;
          // ruling 1: sem alvos, pega também o que tem resistência a magia ou proteção
          const todos = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && isType(c.g, id, 'Artifact') && controllerOf(c.g, id) !== c.you);
          if (todos.length) yield* destroy(c.g, todos);
          return;
        }
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      },
    },
  }],
  rulings: {
    1: 'teste: CR 702.96b: com a sobrecarga, destrói cada artefato que você não controla, sem alvos',
    2: 'regra geral: CR 118.9a — conjurada sem pagar o custo de mana, não pode usar a sobrecarga (motor/mecanicas.ts mayCastFree)',
    3: 'regra geral: CR 601.2f — custo total a partir do custo alternativo (motor/stack.ts totalSpellCost)',
    4: 'teste: CR 702.96b: com a sobrecarga, destrói cada artefato que você não controla, sem alvos',
  },
});
