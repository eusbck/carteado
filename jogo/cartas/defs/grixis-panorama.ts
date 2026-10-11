// Grixis Panorama
// {T}: Add {C}.
// {1}, {T}, Sacrifice this land: Search your library for a basic Island, Swamp, or Mountain card, put it onto the
// battlefield tapped, then shuffle.
import { activated, chars, defineCard, fetchBasicToBattlefield, mana } from '../../motor/api.ts';

const TIPOS = ['Island', 'Swamp', 'Mountain'];

export default defineCard({
  name: 'Grixis Panorama',
  faces: [{
    abilities: [
      mana('C'),
      activated('{1}, {T}, Sacrifice this land', function* (c) {
        yield* fetchBasicToBattlefield(c, 1, { filter: (id) => chars(c.g, id).subtypes.some((s) => TIPOS.includes(s)), prompt: 'Procure uma carta de Island, Swamp ou Mountain básico' });
      }, { text: '{1}, {T}, Sacrifique este terreno: Procure uma carta de Island, Swamp ou Mountain básico, coloque-a no campo virada e embaralhe.' }),
    ],
  }],
  rulings: {},
});
