// Merchant Scroll
// Search your library for a blue instant card, reveal that card, put it into your hand, then shuffle.
import { chars, defineCard, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Merchant Scroll',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: a busca pede uma característica, então pode não achar nada (CR 701.23d)
        yield* searchTo(c, c.you, (id) => { const ch = chars(c.g, id); return ch.types.includes('Instant') && ch.colors.includes('U'); }, 1, 'hand', { reveal: true, prompt: 'Procure uma carta de instantânea azul' });
      },
    },
  }],
  rulings: { 1: 'teste: só serve instantânea azul, e você pode não achar nenhuma' },
});
