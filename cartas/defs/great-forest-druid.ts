// Great Forest Druid
// {T}: Add one mana of any color.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Great Forest Druid',
  faces: [{ abilities: [mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' })] }],
  rulings: {},
});
