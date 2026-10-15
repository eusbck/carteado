// Tainted Field
// {T}: Add {C}.
// {T}: Add {W} or {B}. Activate only if you control a Swamp.
import { chars, controlledBy, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Tainted Field',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana(["W", "B"], {
        condition: (c) => controlledBy(c.g, c.you, (id) => chars(c.g, id).subtypes.includes('Swamp')).length > 0,
        text: '{T}: Adicione {W} ou {B}. Ative somente se você controlar um Swamp.',
      }),
    ],
  }],
  rulings: {},
});
