// Hushwood Verge
// {T}: Add {G}.
// {T}: Add {W}. Activate only if you control a Forest or a Plains.
import { defineCard } from '../../motor/api.ts';
import { manaDeVerge } from '../verges.ts';

export default defineCard({
  name: 'Hushwood Verge',
  faces: [{ abilities: manaDeVerge('G', 'W', ['Forest', 'Plains'], 'uma Floresta ou uma Planície') }],
  rulings: {},
});
