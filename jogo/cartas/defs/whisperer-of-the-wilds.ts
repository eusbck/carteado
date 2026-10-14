// Whisperer of the Wilds
// {T}: Add {G}.
// Ferocious — {T}: Add {G}{G}. Activate only if you control a creature with power 4 or greater.
import { defineCard, mana } from '../../motor/api.ts';
import { temForca4 } from '../dinossauros.ts';

export default defineCard({
  name: 'Whisperer of the Wilds',
  faces: [{
    abilities: [
      mana('G', { text: '{T}: Adicione {G}.' }),
      mana('GG', { condition: (c) => temForca4(c.g, c.you), text: 'Feroz — {T}: Adicione {G}{G}. Ative somente se você controla uma criatura com força 4 ou mais.' }),
    ],
  }],
  rulings: {},
});
