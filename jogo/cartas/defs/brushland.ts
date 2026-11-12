// Brushland
// {T}: Add {C}.
// {T}: Add {G} or {W}. This land deals 1 damage to you.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Brushland',
  faces: [{ abilities: [
    mana('C'),
    land.pain(['G', 'W']),
  ] }],
  rulings: {},
});
