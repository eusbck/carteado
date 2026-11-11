// Sundown Pass
// This land enters tapped unless you control two or more other lands.
// {T}: Add {R} or {W}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Sundown Pass',
  faces: [{ abilities: [
    land.tappedUnlessOtherLands(2),
    mana(['R', 'W']),
  ] }],
  rulings: {},
});
