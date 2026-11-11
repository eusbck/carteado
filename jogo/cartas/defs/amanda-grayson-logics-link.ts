// Amanda Grayson, Logic's Link
// Affinity for Vulcans (This spell costs {1} less to cast for each Vulcan you control.)
// Landfall — Whenever a land you control enters, put two +1/+1 counters on target creature you control.
import { addCounters, chars, controlledBy, defineCard, is, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Amanda Grayson, Logic's Link",
  faces: [{
    // CR 702.41a: afinidade por Vulcans — {1} a menos por Vulcan (qualquer permanente com o subtipo) que você controla
    selfCost: (c) => ({ reduce: controlledBy(c.g, c.you, (id) => chars(c.g, id).subtypes.includes('Vulcan')).length }),
    abilities: [
      triggered(on.landfall(), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, c.you);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Aterragem — Sempre que um terreno que você controla entra, coloque dois marcadores +1/+1 na criatura alvo que você controla.' }),
    ],
  }],
  rulings: {},
});
