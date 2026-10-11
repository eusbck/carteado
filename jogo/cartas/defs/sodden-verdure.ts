// Sodden Verdure
// ({T}: Add {G} or {U}.)
// This land enters tapped unless you control two or more basic lands.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Sodden Verdure",
  // a mana vem dos tipos Forest e Island (CR 305.6)
  faces: [{ abilities: [
    land.tappedUnlessBasics(2),
  ] }],
  rulings: {
    1: 'teste: CR 305.6 e 305.8: tem os tipos Forest e Island, mas não é básico',
  },
});
