// Birds of Paradise
// Flying
// {T}: Add one mana of any color.
// (mesmo texto de Ornithopter of Paradise)
import { defineCard, keyword, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Birds of Paradise',
  faces: [{ abilities: [keyword('flying'), mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' })] }],
  rulings: {},
});
