// Grim Backwoods
// {T}: Add {C}.
// {2}{B}{G}, {T}, Sacrifice a creature: Draw a card.
import { activated, defineCard, draw, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Grim Backwoods',
  faces: [{
    abilities: [
      mana('C'),
      activated('{2}{B}{G}, {T}, Sacrifice a creature', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{2}{B}{G}, {T}, Sacrifique uma criatura: Compre uma carta.' }),
    ],
  }],
  rulings: {},
});
