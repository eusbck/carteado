// Bogslither's Embrace
// As an additional cost to cast this spell, blight 1 or pay {3}. (To blight 1, put a -1/-1 counter on a creature you
// control.)
// Exile target creature.
import { defineCard, exile, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Bogslither's Embrace",
  faces: [{
    additionalCosts: [{ key: 'blight', label: 'blight 1', parts: [{ k: 'blight', n: 1 }], optional: false, orParts: [{ k: 'mana', cost: '{3}' }], orLabel: 'pagar {3}' }],
    spell: {
      targets: [t.creature()],
      *effect(c) { const id = tgt(c); if (id !== null) yield* exile(c.g, [id]); },
    },
  }],
  rulings: {
    1: 'teste: sem criatura, só dá para pagar {3}',
    2: 'regra geral: CR 704.5q — marcadores +1/+1 e -1/-1 se anulam',
    3: 'regra geral: CR 701.68a — blight põe todos os marcadores numa criatura',
    4: 'regra geral: CR 601.2h — custos sem respostas no meio',
    5: 'regra geral: CR 701.68 — pode escolher criatura que vai morrer',
    6: 'regra geral: CR 603.10a — a última informação vê todos os marcadores',
  },
});
