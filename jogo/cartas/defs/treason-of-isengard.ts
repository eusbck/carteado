// Treason of Isengard
// Put up to one target instant or sorcery card from your graveyard on top of your library.
// Amass Orcs 2. (To amass Orcs 2, put two +1/+1 counters on an Army you control. It's also an Orc. If you don't control an
// Army, create a 0/0 black Orc Army creature token first.)
import { amass, defineCard, is, moveObjects, t, tgt, upTo } from '../../motor/api.ts';
import { REUNIR } from '../mordor.ts';

export default defineCard({
  name: 'Treason of Isengard',
  faces: [{
    spell: {
      // ruling 1: pode ser conjurada sem alvo, só para reunir
      targets: [upTo(1, t.card('graveyard', is.instantOrSorcery, 'até uma carta instantânea ou de feitiço alvo no seu cemitério'))],
      *effect(c) {
        const carta = tgt(c);
        if (carta !== null) yield* moveObjects(c.g, [{ id: carta, to: 'library', position: 'top' }], 'effect');
        yield* amass(c.g, c.you, 'Orc', 2);
      },
    },
  }],
  rulings: {
    1: 'teste: sem alvo, só reúne Orcs 2',
    2: REUNIR.escrita,
    3: REUNIR.como,
    4: REUNIR.zumbis,
    5: REUNIR.varios,
    6: REUNIR.entra00,
    7: REUNIR.alvos,
    8: REUNIR.reunido,
  },
});
