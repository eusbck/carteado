// Harrow
// As an additional cost to cast this spell, sacrifice a land.
// Search your library for up to two basic land cards, put them onto the battlefield, then shuffle.
import { defineCard } from '../../motor/api.ts';
import { basico, buscaTerrenos, sacrificaTerrenoCusto } from '../terras.ts';

export default defineCard({
  name: 'Harrow',
  faces: [{
    additionalCosts: [{ key: 'sacrificar', label: 'sacrificar um terreno', optional: false, parts: [sacrificaTerrenoCusto] }],
    spell: { *effect(c) { yield* buscaTerrenos(c, 2, (id) => basico(c.g, id), false, 'Procure até duas cartas de terreno básico'); } },
  }],
  rulings: {
    1: 'regra geral: CR 601.2h — sem terreno para sacrificar, não dá para conjurar',
    2: 'regra geral: CR 305.2 — pôr terrenos no campo não conta como jogar terreno',
  },
});
