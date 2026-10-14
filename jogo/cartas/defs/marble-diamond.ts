// Marble Diamond
// This artifact enters tapped.
// {T}: Add {W}.
import { defineCard, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Marble Diamond',
  faces: [{
    abilities: [
      { ...entersTapped(), text: 'Este artefato entra virado.' },
      mana('W'),
    ],
  }],
  rulings: {},
});
