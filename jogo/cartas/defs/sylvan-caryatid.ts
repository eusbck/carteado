// Sylvan Caryatid — Defender, hexproof. {T}: Add one mana of any color.
import { defineCard, keywords, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Sylvan Caryatid',
  faces: [{ abilities: [...keywords('defender', 'hexproof'), mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' })] }],
});
