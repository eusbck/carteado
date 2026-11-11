// Blood Crypt
// ({T}: Add {B} or {R}.)
// As this land enters, you may pay 2 life. If you don't, it enters tapped.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Blood Crypt',
  faces: [{ abilities: [mana(['B', 'R']), land.payLifeOrTapped(2)] }],
  rulings: {
    1: 'regra geral: CR 305.6 — tem os dois tipos básicos de terreno, mas não é básico (cartas/defs, tipo impresso)',
    2: 'regra geral: CR 614.12 — posto no campo virado por um efeito, entra virado mesmo pagando (land.payLifeOrTapped)',
    3: 'regra geral: CR 305.6 — tem os dois tipos básicos de terreno, mas não é básico (cartas/defs, tipo impresso)',
  },
});
