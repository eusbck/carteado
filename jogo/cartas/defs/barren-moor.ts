// Barren Moor
// This land enters tapped.
// {T}: Add {B}.
// Cycling {B} ({B}, Discard this card: Draw a card.)
import { cycling, defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Barren Moor',
  faces: [{
    abilities: [
      land.tapped(),
      mana('B'),
      cycling('{B}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.29a — ciclagem é habilidade ativada (da mão), não mágica',
  },
});
