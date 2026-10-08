// Mystic Gate
// {T}: Add {C}.
// {W/U}, {T}: Add {W}{W}, {W}{U}, or {U}{U}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Mystic Gate',
  faces: [{ abilities: [
    mana('C'),
    land.filter('W', 'U'),
  ] }],
  rulings: {},
});
