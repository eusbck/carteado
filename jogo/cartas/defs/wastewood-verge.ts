// Wastewood Verge
// {T}: Add {G}.
// {T}: Add {B}. Activate only if you control a Swamp or a Forest.
import { controlledBy, defineCard, isSubtype, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Wastewood Verge',
  faces: [{
    abilities: [
      mana('G'),
      // CR 605.1a: continua sendo habilidade de mana; a restrição olha os tipos de terreno, não os nomes
      mana('B', {
        condition: (c) => controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Swamp') || isSubtype(c.g, id, 'Forest')).length > 0,
        text: '{T}: Adicione {B}. Ative apenas se você controlar um Pântano ou uma Floresta.',
      }),
    ],
  }],
  rulings: {},
});
