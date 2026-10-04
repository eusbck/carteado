// Deceptive Landscape
// {T}: Add {C}.
// {T}, Sacrifice this land: Search your library for a basic Plains, Swamp, or Forest card, put it onto the battlefield tapped, then shuffle.
// Cycling {W}{B}{G} ({W}{B}{G}, Discard this card: Draw a card.)
import { activated, chars, cycling, defineCard, fetchBasicToBattlefield, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Deceptive Landscape',
  faces: [{
    abilities: [
      mana('C'),
      activated('{T}, Sacrifice this land', function* (c) {
        yield* fetchBasicToBattlefield(c, 1, { filter: (id) => chars(c.g, id).subtypes.some((s) => s === 'Plains' || s === 'Swamp' || s === 'Forest'), prompt: 'Procure uma carta de Plains, Swamp ou Forest básico' });
      }, { text: '{T}, Sacrifique este terreno: Procure uma Plains, Swamp ou Forest básica e coloque-a no campo virada; depois embaralhe.' }),
      cycling('{W}{B}{G}'),
    ],
  }],
  rulings: {},
});
