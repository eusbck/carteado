// Charcoal Diamond
// This artifact enters tapped.
// {T}: Add {B}.
import { defineCard, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Charcoal Diamond',
  faces: [{
    abilities: [
      { ...entersTapped(), text: 'Este artefato entra virado.' },
      mana('B', { text: '{T}: Adicione {B}.' }),
    ],
  }],
  rulings: {},
});
