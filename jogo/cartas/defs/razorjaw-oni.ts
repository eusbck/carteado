// Razorjaw Oni
// Black creatures can't block.
import { chars, defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Razorjaw Oni',
  faces: [{
    abilities: [
      staticAbility({ rules: { canBlock: (c, bloqueador) => !chars(c.g, bloqueador).colors.includes('B') }, text: 'Criaturas pretas não podem bloquear.' }),
    ],
  }],
  rulings: {},
});