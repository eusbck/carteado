// Karplusan Forest
// {T}: Add {C}.
// {T}: Add {R} or {G}. This land deals 1 damage to you.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Karplusan Forest',
  faces: [{ abilities: [mana('C', { text: '{T}: Adicione {C}.' }), land.pain(['R', 'G'])] }],
  rulings: {},
});
