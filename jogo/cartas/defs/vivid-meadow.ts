// Vivid Meadow
// This land enters tapped with two charge counters on it.
// {T}: Add {W}.
// {T}, Remove a charge counter from this land: Add one mana of any color.
import { defineCard, entersTapped, entersWithCounters, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Vivid Meadow',
  faces: [{
    abilities: [
      // CR 614.1c: as duas partes são substituições de como entra
      entersTapped(),
      entersWithCounters('charge', 2),
      mana('W'),
      mana('any', { cost: '{T}, Remove a charge counter from this land', text: '{T}, Remova um marcador de carga deste terreno: Adicione uma mana de qualquer cor.' }),
    ],
  }],
  rulings: {},
});
