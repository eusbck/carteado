// Tainted Peak
// {T}: Add {C}.
// {T}: Add {B} or {R}. Activate only if you control a Swamp.
import { chars, controlledBy, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Tainted Peak',
  faces: [{
    abilities: [
      mana('C'),
      // qualquer permanente com o subtipo Swamp (básico ou não)
      mana(['B', 'R'], {
        condition: (c) => controlledBy(c.g, c.you, (id) => chars(c.g, id).subtypes.includes('Swamp')).length > 0,
        text: '{T}: Adicione {B} ou {R}. Ative apenas se você controlar um Swamp.',
      }),
    ],
  }],
  rulings: {},
});
