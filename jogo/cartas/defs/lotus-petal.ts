// Lotus Petal
// {T}, Sacrifice this artifact: Add one mana of any color.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Lotus Petal',
  faces: [{ abilities: [{ ...mana('any', { text: '{T}, Sacrifique este artefato: Adicione uma mana de qualquer cor.' }), cost: [{ k: 'tap' }, { k: 'sacrificeSelf' }] }] }],
  rulings: {},
});