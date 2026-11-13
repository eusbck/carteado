// Crop Rotation
// As an additional cost to cast this spell, sacrifice a land.
// Search your library for a land card, put that card onto the battlefield, then shuffle.
import { additionalCost, defineCard, is } from '../../motor/api.ts';
import { buscaTerrenosParaOCampo } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Crop Rotation',
  faces: [{
    // ruling 1: exatamente um terreno, obrigatório
    additionalCosts: [additionalCost('sacrificar', 'sacrificar um terreno', [{ k: 'sacrifice', n: 1, filter: is.land, label: 'um terreno' }])],
    spell: {
      *effect(c) {
        yield* buscaTerrenosParaOCampo(c, 1, 'Crop Rotation: procure uma carta de terreno');
      },
    },
  }],
  rulings: { 1: 'teste: sem terreno para sacrificar, não pode ser conjurada' },
});
