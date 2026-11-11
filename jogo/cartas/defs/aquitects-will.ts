// Aquitect's Will
// Put a flood counter on target land. That land is an Island in addition to its other types for as long as it has a
// flood counter on it. If you control a Merfolk, draw a card.
import { addCounters, addEffect, controlledBy, defineCard, draw, isSubtype, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Aquitect's Will",
  faces: [{
    spell: {
      targets: [t.land()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) {
          addCounters(c.g, { kind: 'obj', id }, 'flood', 1, c.you);
          // camada 4 (CR 305.6-305.7): ganha o tipo Island e a habilidade de mana dele, enquanto tiver um marcador de
          // inundação (motor: duração whileHasCounter)
          if ((c.g.state.objects[id]?.counters.flood ?? 0) > 0) {
            addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileHasCounter', obj: id, counter: 'flood' }, affected: [id], mods: [{ k: 'addTypes', subtypes: ['Island'] }, { k: 'addAbility', id: 'basic:U' }] });
          }
        }
        // "se você controla um Merfolk" é visto na resolução (um polimorfo conta)
        if (controlledBy(c.g, c.you, (x) => isSubtype(c.g, x, 'Merfolk')).length) yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: {
    1: 'não se aplica: o tipo "tribal" virou "kindred" sem mudar como a carta funciona',
    2: 'regra geral: CR 308 — kindred é um tipo de carta com subtipos de criatura (dados Oracle)',
    3: 'regra geral: CR 205.2 — kindred conta como tipo de carta (dados Oracle)',
  },
});
