// Overgrown Tomb
// ({T}: Add {B} or {G}.)
// As this land enters, you may pay 2 life. If you don't, it enters tapped.
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: 'Overgrown Tomb',
  // a mana vem dos tipos Swamp e Forest (CR 305.6)
  faces: [{ abilities: [land.payLifeOrTapped(2)] }],
  rulings: {
    1: 'regra geral: CR 305.6 — tem os dois tipos básicos de terreno, mas não é básico (cartas/defs, tipo impresso)',
    2: 'teste: posto no campo virado por um efeito, entra virado mesmo pagando 2 de vida',
    3: 'regra geral: CR 305.6 — tem os dois tipos básicos de terreno, mas não é básico (cartas/defs, tipo impresso)',
    4: 'teste: posto no campo virado por um efeito, entra virado mesmo pagando 2 de vida',
  },
});
