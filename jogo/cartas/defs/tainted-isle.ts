// Tainted Isle
// {T}: Add {C}.
// {T}: Add {U} or {B}. Activate only if you control a Swamp.
import { chars, controlledBy, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Tainted Isle',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana(["U", "B"], {
        condition: (c) => controlledBy(c.g, c.you, (id) => chars(c.g, id).subtypes.includes('Swamp')).length > 0,
        text: '{T}: Adicione {U} ou {B}. Ative somente se você controlar um Swamp.',
      }),
    ],
  }],
  rulings: {},
});
