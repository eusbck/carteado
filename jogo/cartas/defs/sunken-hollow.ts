// Sunken Hollow
// ({T}: Add {U} or {B}.)
// This land enters tapped unless you control two or more basic lands.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Sunken Hollow",
  // a mana vem dos tipos Island e Swamp (CR 305.6)
  faces: [{ abilities: [
    land.tappedUnlessBasics(2),
  ] }],
  rulings: {
    1: 'teste: CR 305.8: não é básico; dois deles não fazem outro entrar desvirado',
    2: 'teste: CR 614.12: terrenos básicos que entram ao mesmo tempo não contam',
    3: 'teste: CR 305.6: tem os tipos Island e Swamp (conta para quem procura esses tipos)',
  },
});
