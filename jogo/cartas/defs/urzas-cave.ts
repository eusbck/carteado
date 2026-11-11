// Urza's Cave
// {T}: Add {C}.
// {3}, {T}, Sacrifice this land: Search your library for a land card, put it onto the battlefield tapped, then shuffle.
import { activated, defineCard, mana } from '../../motor/api.ts';
import { buscaTerrenos } from '../terras.ts';

export default defineCard({
  name: "Urza's Cave",
  faces: [{
    abilities: [
      mana('C'),
      activated('{3}, {T}, Sacrifice this land', function* (c) { yield* buscaTerrenos(c, 1, () => true, true); }, { text: '{3}, {T}, Sacrifique este terreno: Procure uma carta de terreno, coloque-a no campo de batalha virada e depois embaralhe.' }),
    ],
  }],
  rulings: {},
});
