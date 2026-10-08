// Ash Barrens
// {T}: Add {C}.
// Basic landcycling {1} ({1}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)
import { basicLandcycling, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Ash Barrens',
  faces: [{ abilities: [mana('C'), basicLandcycling('{1}')] }],
  rulings: {},
});
