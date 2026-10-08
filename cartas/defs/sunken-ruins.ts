// Sunken Ruins
// {T}: Add {C}.
// {U/B}, {T}: Add {U}{U}, {U}{B}, or {B}{B}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Sunken Ruins',
  faces: [{ abilities: [
    mana('C'),
    land.filter('U', 'B'),
  ] }],
  rulings: {},
});
