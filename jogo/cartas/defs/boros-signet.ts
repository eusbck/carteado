// Boros Signet
// {1}, {T}: Add {R}{W}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Boros Signet',
  faces: [{ abilities: [mana('RW', { cost: '{1}, {T}', text: '{1}, {T}: Adicione {R}{W}.' })] }],
  rulings: {},
});
