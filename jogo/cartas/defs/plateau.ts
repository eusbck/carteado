// Plateau
// ({T}: Add {R} or {W}.)
import { defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Plateau',
  // a mana vem dos tipos Mountain e Plains (CR 305.6)
  faces: [{ abilities: [] }],
  rulings: {
    1: 'teste: CR 305.6: mana dos dois tipos básicos de terreno',
    2: 'teste: CR 305.8: tem os tipos básicos, mas não é terreno básico',
  },
});
