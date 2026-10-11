// Desert of the Glorified
// This land enters tapped.
// {T}: Add {B}.
// Cycling {1}{B} ({1}{B}, Discard this card: Draw a card.)
import { cycling, defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Desert of the Glorified',
  faces: [{ abilities: [
    land.tapped(),
    mana('B'),
    cycling('{1}{B}'),
  ] }],
  rulings: {
    1: 'teste: CR 205.3i: Desert não dá habilidade de mana intrínseca (só a impressa, {B})',
  },
});
