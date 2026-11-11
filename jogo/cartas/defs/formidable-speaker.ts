// Formidable Speaker
// When this creature enters, you may discard a card. If you do, search your library for a creature card, reveal it, put
// it into your hand, then shuffle.
// {1}, {T}: Untap another target permanent.
import { activated, defineCard, discard, etb, is, isCreature, searchTo, t, tgt, untap, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Formidable Speaker',
  faces: [{
    abilities: [
      etb(function* (c) {
        if (!c.g.state.zones.hand[c.you].length || !(yield* yesNo(c.g, c.you, 'Formidable Speaker: descartar uma carta para buscar uma criatura?'))) return;
        const d = yield* discard(c.g, c.you, 1);
        if (d.length) yield* searchTo(c, c.you, (id) => isCreature(c.g, id), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de criatura' });
      }, { text: 'Quando esta criatura entra, você pode descartar uma carta. Se fizer isso, procure uma carta de criatura, revele-a, coloque-a na sua mão e depois embaralhe.' }),
      activated('{1}, {T}', function* (c) { const id = tgt(c); if (id !== null) untap(c.g, id); }, { targets: [t.permanent(is.other, 'outro permanente alvo')], text: '{1}, {T}: Desvire outro permanente alvo.' }),
    ],
  }],
  rulings: {},
});
