// Badlands
// ({T}: Add {B} or {R}.)
import { defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Badlands',
  // a mana vem dos tipos Swamp e Mountain (CR 305.6)
  faces: [{ abilities: [] }],
  rulings: {
    1: 'teste: CR 305.6: mana dos dois tipos básicos de terreno',
    2: 'teste: CR 305.8: tem os tipos básicos, mas não é terreno básico',
    3: 'não se aplica: nenhuma carta dos decks muda o texto de um tipo de terreno só',
    4: 'teste: CR 205.3i: é Swamp e Mountain também fora do campo',
  },
});
