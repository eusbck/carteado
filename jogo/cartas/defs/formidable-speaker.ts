// Formidable Speaker
// When this creature enters, you may discard a card. If you do, search your library for a creature card, reveal it, put it
// into your hand, then shuffle.
// {1}, {T}: Untap another target permanent.
import { activated, defineCard, discard, etb, is, searchTo, t, tgt, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Formidable Speaker',
  faces: [{
    abilities: [
      etb(function* (c) {
        if (!c.g.state.zones.hand[c.you].length) return;
        const descartadas = yield* discard(c.g, c.you, 1, { upTo: true });
        if (!descartadas.length) return;
        yield* searchTo(c, c.you, (id) => is.creature(c, id), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de criatura' });
      }, { text: 'Quando esta criatura entra, você pode descartar uma carta. Se fizer isso, procure no seu grimório uma carta de criatura, revele-a, coloque-a na sua mão e depois embaralhe.' }),
      activated('{1}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untap(c.g, id);
      }, { targets: [{ ...t.permanent((c, id) => id !== c.source, 'outra permanente alvo') }], text: '{1}, {T}: Desvire outra permanente alvo.' }),
    ],
  }],
  rulings: {},
});
