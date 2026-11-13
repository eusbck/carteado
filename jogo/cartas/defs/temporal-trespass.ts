// Temporal Trespass
// Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)
// Take an extra turn after this one. Exile Temporal Trespass.
import { defineCard, moveObjects, takeExtraTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Temporal Trespass',
  faces: [{
    // CR 702.66: delve (motor/stack.ts)
    delve: true,
    spell: {
      *effect(c) {
        // CR 500.7: o turno extra vem logo depois deste
        takeExtraTurn(c.g, c.you);
        // "Exile Temporal Trespass": sai da pilha para o exílio em vez do cemitério (uma cópia não é exilada: CR 707.10)
        if (c.g.state.objects[c.source]?.zone === 'stack') yield* moveObjects(c.g, [{ id: c.source, to: 'exile' }], 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.66b — o valor de mana continua 11 (motor/stack.ts)',
    2: 'teste: delve paga só o genérico',
    3: 'regra geral: CR 702.66b — delve não é custo alternativo (motor/stack.ts)',
  },
});
