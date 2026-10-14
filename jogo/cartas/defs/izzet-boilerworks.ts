// Izzet Boilerworks
// This land enters tapped.
// When this land enters, return a land you control to its owner's hand.
// {T}: Add {U}{R}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Izzet Boilerworks',
  faces: [{ abilities: [
    land.tapped(),
    land.bounceLand(),
    mana('UR'),
  ] }],
  rulings: {
    1: 'teste: sem outro terreno, devolve a si mesmo para a mão',
  },
});
