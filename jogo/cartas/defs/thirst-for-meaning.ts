// Thirst for Meaning
// Draw three cards. Then discard two cards unless you discard an enchantment card.
import { chooseItems, defineCard, discard, draw, isType, moveObjects, nameOf } from '../../motor/api.ts';

export default defineCard({
  name: 'Thirst for Meaning',
  faces: [{
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 3);
        const mao = c.g.state.zones.hand[c.you];
        if (mao.length === 0) return;
        // ruling 1: descarta uma carta de encantamento ou duas cartas quaisquer (que podem ser encantamentos)
        const encantamentos = mao.filter((id) => isType(c.g, id, 'Enchantment'));
        if (encantamentos.length) {
          const [r] = yield* chooseItems(c.g, c.you, 'Thirst for Meaning: descarte uma carta de encantamento ou duas cartas', [
            { id: 'nao', label: 'Descartar duas cartas' },
            ...encantamentos.map((id) => ({ id: String(id), label: `Descartar ${nameOf(c.g, id)}`, obj: id, card: { def: c.g.state.objects[id].def } })),
          ], 1, 1);
          if (r !== 'nao') { yield* moveObjects(c.g, [{ id: Number(r), to: 'graveyard' }], 'discard'); return; }
        }
        yield* discard(c.g, c.you, 2);
      },
    },
  }],
  rulings: {
    1: 'teste: descarta uma carta de encantamento em vez de duas; ou duas cartas quaisquer',
  },
});
