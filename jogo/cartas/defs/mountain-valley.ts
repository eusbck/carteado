// Mountain Valley
// This land enters tapped.
// {T}, Sacrifice this land: Search your library for a Mountain or Forest card, put it onto the battlefield, then shuffle.
import { activated, defineCard, land } from '../../motor/api.ts';
import { buscaTerrenos, tipoDeTerreno } from '../terras.ts';

export default defineCard({
  name: "Mountain Valley",
  faces: [{
    abilities: [
      land.tapped(),
      activated('{T}, Sacrifice this land', function* (c) {
        yield* buscaTerrenos(c, 1, (id) => tipoDeTerreno(c.g, id, 'Mountain', 'Forest'), false, 'Procure uma carta de Mountain ou Forest');
      }, { text: '{T}, Sacrifique este terreno: Procure uma carta de Mountain ou Forest, coloque-a no campo de batalha e depois embaralhe.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 305.7 — acha qualquer carta com o tipo, inclusive terrenos não básicos com ele' },
});
