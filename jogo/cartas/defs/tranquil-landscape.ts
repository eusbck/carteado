// Tranquil Landscape
// {T}: Add {C}.
// {T}, Sacrifice this land: Search your library for a basic Forest, Plains, or Island card, put it onto the battlefield tapped, then shuffle.
// Cycling {G}{W}{U} ({G}{W}{U}, Discard this card: Draw a card.)
import { activated, chars, cycling, defineCard, fetchBasicToBattlefield, mana } from '../../motor/api.ts';

const TIPOS = ['Forest', 'Plains', 'Island'];

export default defineCard({
  name: 'Tranquil Landscape',
  faces: [{
    abilities: [
      mana('C'),
      activated('{T}, Sacrifice this land', function* (c) {
        // CR 701.23: procura um terreno básico com um desses tipos; entra virado e depois embaralha
        yield* fetchBasicToBattlefield(c, 1, { filter: (id) => chars(c.g, id).subtypes.some((s) => TIPOS.includes(s)), prompt: 'Procure uma carta de Forest, Plains ou Island básico' });
      }, { text: '{T}, Sacrifique este terreno: Procure uma carta de Forest, Plains ou Island básico e coloque-a no campo virada; depois embaralhe.' }),
      cycling('{G}{W}{U}'),
    ],
  }],
  rulings: {},
});
