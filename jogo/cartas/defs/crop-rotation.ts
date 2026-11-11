// Crop Rotation
// As an additional cost to cast this spell, sacrifice a land.
// Search your library for a land card, put that card onto the battlefield, then shuffle.
import { defineCard } from '../../motor/api.ts';
import { buscaTerrenos, sacrificaTerrenoCusto } from '../terras.ts';

export default defineCard({
  name: 'Crop Rotation',
  faces: [{
    additionalCosts: [{ key: 'sacrificar', label: 'sacrificar um terreno', optional: false, parts: [sacrificaTerrenoCusto] }],
    spell: { *effect(c) { yield* buscaTerrenos(c, 1); } },
  }],
  rulings: { 1: 'regra geral: CR 601.2h — o terreno sacrificado não volta se a mágica for anulada' },
});
