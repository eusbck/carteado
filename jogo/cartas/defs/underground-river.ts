// Underground River
// {T}: Add {C}.
// {T}: Add {U} or {B}. This land deals 1 damage to you.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Underground River',
  faces: [{ abilities: [
    mana('C'),
    land.pain(['U', 'B']),
  ] }],
  rulings: {},
});
