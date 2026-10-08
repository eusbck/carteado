// Despark
// Exile target permanent with mana value 4 or greater.
import { defineCard, exile, is, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Despark',
  faces: [{
    spell: {
      targets: [t.permanent(is.mvAtLeast(4), 'permanente alvo com valor de mana 4 ou mais')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* exile(c.g, [id]); },
    },
  }],
  rulings: { 1: 'regra geral: CR 107.3g — X vale 0 fora da pilha (manaValueOf)' },
});
