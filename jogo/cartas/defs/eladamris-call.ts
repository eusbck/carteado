// Eladamri's Call
// Search your library for a creature card, reveal that card, put it into your hand, then shuffle.
import { defineCard, isCreature, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: "Eladamri's Call",
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: a busca tem uma qualidade, então você pode não achar (CR 701.23b)
        yield* searchTo(c, c.you, (id) => isCreature(c.g, id), 1, 'hand', { reveal: true, prompt: "Eladamri's Call: procure uma carta de criatura" });
      },
    },
  }],
  rulings: { 1: 'teste: você pode não achar a carta de criatura' },
});
