// Springleaf Drum
// {T}, Tap an untapped creature you control: Add one mana of any color.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Springleaf Drum',
  faces: [{
    abilities: [
      // rulings 1-2: virar a criatura é custo, não o símbolo {T} dela: vale com enjoo de invocação
      { ...mana('any', { text: '{T}, Vire uma criatura desvirada que você controla: Adicione uma mana de qualquer cor.' }), cost: [{ k: 'tap' }, { k: 'tapCreatures', n: 1 }] },
    ],
  }],
  rulings: {
    1: 'teste: vira o Drum e uma criatura sua, mesmo com enjoo de invocação, para uma mana de qualquer cor',
    2: 'teste: vira o Drum e uma criatura sua, mesmo com enjoo de invocação, para uma mana de qualquer cor',
  },
});