// Blazemire Verge
// {T}: Add {B}.
// {T}: Add {R}. Activate only if you control a Swamp or a Mountain.
import { defineCard } from '../../motor/api.ts';
import { manaDeVerge } from '../verges.ts';

export default defineCard({
  name: 'Blazemire Verge',
  faces: [{ abilities: manaDeVerge('B', 'R', ['Swamp', 'Mountain'], 'um Pântano ou uma Montanha') }],
  rulings: {},
});
