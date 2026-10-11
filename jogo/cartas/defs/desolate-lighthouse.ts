// Desolate Lighthouse
// {T}: Add {C}.
// {1}{U}{R}, {T}: Draw a card, then discard a card.
import { activated, defineCard, loot, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Desolate Lighthouse',
  faces: [{
    abilities: [
      mana('C'),
      activated('{1}{U}{R}, {T}', function* (c) {
        yield* loot(c, c.you, 1, 1);
      }, { text: '{1}{U}{R}, {T}: Compre uma carta, depois descarte uma carta.' }),
    ],
  }],
  rulings: {},
});
