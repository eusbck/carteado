// Turbulent Shore — Land — Plains Island
// ({T}: Add {W} or {U}.)
// This land enters tapped unless your opponents control eight or more lands.
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: 'Turbulent Shore',
  // a mana vem dos tipos Plains e Island (CR 305.6); a contagem soma os terrenos de todos os oponentes
  faces: [{ abilities: [
    land.tappedUnlessOpponentsLands(8),
  ] }],
  rulings: {
    1: 'teste: CR 305.6 e 305.8: tem os tipos Plains e Island sem ser básico',
    2: 'teste: CR 614.12: terrenos dos oponentes que entram ao mesmo tempo não contam',
  },
});
