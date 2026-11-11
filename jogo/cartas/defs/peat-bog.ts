// Peat Bog
// This land enters tapped with two depletion counters on it.
// {T}, Remove a depletion counter from this land: Add {B}{B}. If there are no depletion counters on this land, sacrifice it.
import { defineCard, entersTapped, entersWithCounters, mana, sacrifice } from '../../motor/api.ts';

export default defineCard({
  name: 'Peat Bog',
  faces: [{
    abilities: [
      entersTapped(),
      entersWithCounters('depletion', 2),
      mana('BB', {
        cost: '{T}, Remove a depletion counter from this land',
        text: '{T}, Remova um marcador de esgotamento deste terreno: Adicione {B}{B}. Se não houver marcadores de esgotamento neste terreno, sacrifique-o.',
        *extra(c) {
          const o = c.g.state.objects[c.source];
          if (o && o.zone === 'battlefield' && (o.counters.depletion ?? 0) <= 0) yield* sacrifice(c.g, [c.source]);
        },
      }),
    ],
  }],
  rulings: {},
});
