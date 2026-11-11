// Taiga
// ({T}: Add {R} or {G}.)
import { defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Taiga',
  // a mana vem dos tipos Mountain e Forest (CR 305.6)
  faces: [{ abilities: [] }],
  rulings: {
    1: 'teste: CR 305.6: mana dos dois tipos básicos de terreno',
    2: 'teste: CR 305.8: tem os tipos básicos, mas não é terreno básico',
  },
});
