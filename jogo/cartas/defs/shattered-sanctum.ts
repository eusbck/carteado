// Shattered Sanctum
// This land enters tapped unless you control two or more other lands.
// {T}: Add {W} or {B}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Shattered Sanctum',
  faces: [{ abilities: [land.tappedUnlessOtherLands(2), mana(['W', 'B'])] }],
  rulings: {},
});
