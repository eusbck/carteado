// Gloomlake Verge — {T}: Add {U}. {T}: Add {B}. Activate only if you control a Island or a Swamp.
import { controlledBy, defineCard, isSubtype, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Gloomlake Verge',
  faces: [{
    abilities: [
      mana('U'),
      mana('B', {
        condition: (c) => controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Island') || isSubtype(c.g, id, 'Swamp')).length > 0,
        text: '{T}: Adicione {B}. Ative só se você controlar um Island ou um Swamp.',
      }),
    ],
  }],
  rulings: {},
});
