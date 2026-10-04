// Negate
// Counter target noncreature spell.
import { counter, defineCard, is, not, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Negate',
  faces: [{
    spell: {
      targets: [t.spell(not(is.creature), 'mágica não criatura alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
    },
  }],
  rulings: { 1: 'teste: não pode mirar mágica de criatura' },
});
