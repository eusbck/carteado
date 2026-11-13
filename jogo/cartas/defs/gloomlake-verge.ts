// Gloomlake Verge
// {T}: Add {U}.
// {T}: Add {B}. Activate only if you control a Island or a Swamp.
import { controlledBy, defineCard, isSubtype, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Gloomlake Verge',
  faces: [{
    abilities: [
      mana('U'),
      // CR 605.1a: continua sendo habilidade de mana; a restrição olha os tipos de terreno, não os nomes
      mana('B', {
        condition: (c) => controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Island') || isSubtype(c.g, id, 'Swamp')).length > 0,
        text: '{T}: Adicione {B}. Ative apenas se você controlar uma Ilha ou um Pântano.',
      }),
    ],
  }],
  rulings: {},
});
