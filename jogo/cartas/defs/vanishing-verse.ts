// Vanishing Verse
// Exile target monocolored permanent.
import { defineCard, exile, is, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Vanishing Verse',
  faces: [{
    spell: {
      targets: [t.permanent(is.monocolored, 'permanente monocolorido alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* exile(c.g, [id]); },
    },
  }],
  rulings: { 1: 'teste: incolores e multicoloridos não são alvos' },
});
