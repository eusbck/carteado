// The Dross Pits
// This land enters tapped.
// {T}: Add {B}.
// {1}{B}, {T}, Sacrifice this land: Draw a card.
import { activated, defineCard, draw, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'The Dross Pits',
  faces: [{
    abilities: [
      entersTapped(),
      mana('B'),
      activated('{1}{B}, {T}, Sacrifice this land', function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: '{1}{B}, {T}, Sacrifique este terreno: Compre uma carta.' }),
    ],
  }],
  rulings: {},
});
