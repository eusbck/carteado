// Rocky Tar Pit
// This land enters tapped.
// {T}, Sacrifice this land: Search your library for a Swamp or Mountain card, put it onto the battlefield, then shuffle.
import { activated, defineCard, land } from '../../motor/api.ts';
import { buscaTerrenos, tipoDeTerreno } from '../terras.ts';

export default defineCard({
  name: "Rocky Tar Pit",
  faces: [{
    abilities: [
      land.tapped(),
      activated('{T}, Sacrifice this land', function* (c) {
        yield* buscaTerrenos(c, 1, (id) => tipoDeTerreno(c.g, id, 'Swamp', 'Mountain'), false, 'Procure uma carta de Swamp ou Mountain');
      }, { text: '{T}, Sacrifique este terreno: Procure uma carta de Swamp ou Mountain, coloque-a no campo de batalha e depois embaralhe.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 305.7 — acha qualquer carta com o tipo, inclusive terrenos não básicos com ele' },
});
