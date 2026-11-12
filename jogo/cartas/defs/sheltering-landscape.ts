// Sheltering Landscape
// {T}: Add {C}.
// {T}, Sacrifice this land: Search your library for a basic Mountain, Forest, or Plains card, put it onto the
// battlefield tapped, then shuffle.
// Cycling {R}{G}{W} ({R}{G}{W}, Discard this card: Draw a card.)
import { activated, chars, cycling, defineCard, fetchBasicToBattlefield, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Sheltering Landscape',
  faces: [{
    abilities: [
      mana('C'),
      activated('{T}, Sacrifice this land', function* (c) {
        yield* fetchBasicToBattlefield(c, 1, {
          tapped: true,
          filter: (id) => chars(c.g, id).subtypes.some((s) => s === 'Mountain' || s === 'Forest' || s === 'Plains'),
          prompt: 'Procure uma carta de Montanha, Floresta ou Planície básica',
        });
      }, { text: '{T}, Sacrifique este terreno: Procure uma carta de Montanha, Floresta ou Planície básica, coloque-a no campo virada e depois embaralhe.' }),
      cycling('{R}{G}{W}'),
    ],
  }],
  rulings: {},
});
