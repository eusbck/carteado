// Prairie Stream — Land — Plains Island
// ({T}: Add {W} or {U}.)
// This land enters tapped unless you control two or more basic lands.
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: 'Prairie Stream',
  // a mana vem dos tipos Plains e Island (CR 305.6)
  faces: [{ abilities: [
    land.tappedUnlessBasics(2),
  ] }],
  rulings: {
    1: 'teste: CR 614.12: terrenos básicos que entram ao mesmo tempo não contam',
    2: 'teste: CR 305.6: tem os tipos Plains e Island (conta para quem procura esses tipos)',
    3: 'teste: CR 305.8: não é básico; dois deles não fazem outro entrar desvirado',
  },
});
