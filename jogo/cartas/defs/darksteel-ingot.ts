// Darksteel Ingot
// Indestructible (Effects that say "destroy" don't destroy this artifact.)
// {T}: Add one mana of any color.
import { defineCard, keyword, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Darksteel Ingot',
  faces: [{ abilities: [keyword('indestructible'), mana('any')] }],
  rulings: {},
});