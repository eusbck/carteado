// Willowrush Verge
// {T}: Add {U}.
// {T}: Add {G}. Activate only if you control a Forest or a Island.
import { controlledBy, defineCard, isSubtype, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Willowrush Verge',
  faces: [{
    abilities: [
      mana('U'),
      // CR 605.1a: continua sendo habilidade de mana; a restrição olha os tipos de terreno, não os nomes
      mana('G', {
        condition: (c) => controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Forest') || isSubtype(c.g, id, 'Island')).length > 0,
        text: '{T}: Adicione {G}. Ative apenas se você controlar uma Floresta ou uma Ilha.',
      }),
    ],
  }],
  rulings: {},
});
