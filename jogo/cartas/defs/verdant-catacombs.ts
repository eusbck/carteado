// Verdant Catacombs
// {T}, Pay 1 life, Sacrifice this land: Search your library for a Swamp or Forest card, put it onto the battlefield, then shuffle.
import { activated, defineCard } from '../../motor/api.ts';
import { buscaTerrenos, tipoDeTerreno } from '../terras.ts';

export default defineCard({
  name: "Verdant Catacombs",
  faces: [{
    abilities: [
      activated('{T}, Pay 1 life, Sacrifice this land', function* (c) {
        yield* buscaTerrenos(c, 1, (id) => tipoDeTerreno(c.g, id, 'Swamp', 'Forest'), false, 'Procure uma carta de Swamp ou Forest');
      }, { text: '{T}, Pague 1 de vida, Sacrifique este terreno: Procure uma carta de Swamp ou Forest, coloque-a no campo de batalha e depois embaralhe.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 305.7 — acha qualquer carta com o tipo, inclusive terrenos não básicos com ele' },
});
