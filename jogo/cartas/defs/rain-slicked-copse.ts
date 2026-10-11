// Rain-Slicked Copse
// ({T}: Add {G} or {U}.)
// This land enters tapped.
// Cycling {2} ({2}, Discard this card: Draw a card.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { cycling, defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Rain-Slicked Copse",
  // a mana vem dos tipos Forest e Island (CR 305.6)
  faces: [{ abilities: [
    land.tapped(),
    cycling('{2}'),
  ] }],
  rulings: {
    1: 'teste: CR 305.6 e 305.8: tem os tipos Forest e Island, mas não é básico',
  },
});
