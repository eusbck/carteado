// Slither Blade
// This creature can't be blocked.
import { defineCard, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Slither Blade',
  faces: [{
    abilities: [
      { ...keyword('unblockable'), text: 'Esta criatura não pode ser bloqueada.' },
    ],
  }],
  rulings: {},
});
