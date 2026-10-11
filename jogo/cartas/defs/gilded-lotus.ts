// Gilded Lotus
// {T}: Add three mana of any one color.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Gilded Lotus',
  faces: [{ abilities: [mana(['WWW', 'UUU', 'BBB', 'RRR', 'GGG'], { text: '{T}: Adicione três manas de uma mesma cor qualquer.' })] }],
  rulings: {},
});
