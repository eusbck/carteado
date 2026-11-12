// Fauna Shaman
// {G}, {T}, Discard a creature card: Search your library for a creature card, reveal it, put it into your hand, then
// shuffle.
import { activated, cost, defineCard, isCreature, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Fauna Shaman',
  faces: [{
    abilities: [
      activated([...cost('{G}, {T}'), { k: 'discard', n: 1, label: 'carta de criatura', filter: (c, id) => isCreature(c.g, id) }], function* (c) {
        yield* searchTo(c, c.you, (id) => isCreature(c.g, id), 1, 'hand', { reveal: true, prompt: 'Fauna Shaman: procure uma carta de criatura' });
      }, { text: '{G}, {T}, Descarte uma carta de criatura: Procure uma carta de criatura no seu grimório, revele-a, coloque-a na sua mão e depois embaralhe.' }),
    ],
  }],
  rulings: {},
});
