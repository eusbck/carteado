// Savannah
// ({T}: Add {G} or {W}.)
import { defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Savannah',
  // a mana vem dos tipos Forest e Plains (CR 305.6)
  faces: [{ abilities: [] }],
  rulings: {
    1: 'teste: CR 305.6: mana dos dois tipos básicos de terreno',
    2: 'teste: CR 305.8: tem os tipos básicos, mas não é terreno básico',
  },
});
