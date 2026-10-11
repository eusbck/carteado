// Cyclonic Rift
// Return target nonland permanent you don't control to its owner's hand.
// Overload {6}{U} (You may cast this spell for its overload cost. If you do, change "target" in its text to "each.")
import { controllerOf, defineCard, isLand, overload, overloaded, returnToHand, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Cyclonic Rift',
  faces: [{
    // CR 702.96a-b: pago o custo de sobrecarga, "alvo" vira "cada" e a mágica não tem alvos
    altCosts: [overload('{6}{U}')],
    spell: {
      targets: [t.nonlandPermanent((c, id) => controllerOf(c.g, id) !== c.you, 'permanente não terreno alvo que você não controla')],
      *effect(c) {
        if (overloaded(c)) {
          const s = c.g.state;
          // ruling 2: sem alvos, pega também o que tem resistência a magia ou proteção
          const todos = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && !isLand(c.g, id) && controllerOf(c.g, id) !== c.you);
          if (todos.length) yield* returnToHand(c.g, todos);
          return;
        }
        const id = tgt(c);
        if (id !== null) yield* returnToHand(c.g, [id]);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 118.9a — conjurada sem pagar o custo de mana, não pode usar a sobrecarga (motor/mecanicas.ts mayCastFree)',
    2: 'teste: CR 702.96b: com a sobrecarga, devolve cada permanente não terreno que você não controla, sem alvos',
    3: 'teste: CR 702.96b: com a sobrecarga, devolve cada permanente não terreno que você não controla, sem alvos',
    4: 'regra geral: CR 601.2f — custo total a partir do custo alternativo (motor/stack.ts totalSpellCost)',
  },
});
