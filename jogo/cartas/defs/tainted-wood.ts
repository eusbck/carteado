// Tainted Wood
// {T}: Add {C}.
// {T}: Add {B} or {G}. Activate only if you control a Swamp.
import { chars, controlledBy, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Tainted Wood',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana(['B', 'G'], {
        condition: (c) => controlledBy(c.g, c.you, (id) => chars(c.g, id).subtypes.includes('Swamp')).length > 0,
        text: '{T}: Adicione {B} ou {G}. Ative somente se você controlar um Swamp.',
      }),
    ],
  }],
  rulings: {},
});
