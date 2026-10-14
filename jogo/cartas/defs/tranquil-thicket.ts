// Tranquil Thicket
// This land enters tapped.
// {T}: Add {G}.
// Cycling {G} ({G}, Discard this card: Draw a card.)
import { cycling, defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Tranquil Thicket',
  faces: [{
    abilities: [
      land.tapped(),
      mana('G'),
      cycling('{G}'),
    ],
  }],
  rulings: {},
});
