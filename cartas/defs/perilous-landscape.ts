// Perilous Landscape
// {T}: Add {C}.
// {T}, Sacrifice this land: Search your library for a basic Island, Mountain, or Plains card, put it onto the battlefield tapped, then shuffle.
// Cycling {U}{R}{W} ({U}{R}{W}, Discard this card: Draw a card.)
import { activated, chars, cycling, defineCard, fetchBasicToBattlefield, mana } from '../../motor/api.ts';

const TIPOS = ['Island', 'Mountain', 'Plains'];

export default defineCard({
  name: 'Perilous Landscape',
  faces: [{
    abilities: [
      mana('C'),
      activated('{T}, Sacrifice this land', function* (c) {
        // CR 701.23: procura um terreno básico com um desses tipos; entra virado e depois embaralha
        yield* fetchBasicToBattlefield(c, 1, { filter: (id) => chars(c.g, id).subtypes.some((s) => TIPOS.includes(s)), prompt: 'Procure uma carta de Island, Mountain ou Plains básico' });
      }, { text: '{T}, Sacrifique este terreno: Procure uma carta de Island, Mountain ou Plains básico e coloque-a no campo virada; depois embaralhe.' }),
      cycling('{U}{R}{W}'),
    ],
  }],
  rulings: {},
});
