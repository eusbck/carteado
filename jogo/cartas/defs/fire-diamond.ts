// Fire Diamond
// This artifact enters tapped.
// {T}: Add {R}.
// (mesmo texto de Charcoal Diamond)
import { defineCard, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Fire Diamond',
  faces: [{
    abilities: [
      { ...entersTapped(), text: 'Este artefato entra virado.' },
      mana('R', { text: '{T}: Adicione {R}.' }),
    ],
  }],
  rulings: {},
});
