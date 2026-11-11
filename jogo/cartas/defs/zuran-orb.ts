// Zuran Orb
// Sacrifice a land: You gain 2 life.
import { activated, defineCard, gainLife } from '../../motor/api.ts';
import { sacrificaTerrenoCusto } from '../terras.ts';

export default defineCard({
  name: 'Zuran Orb',
  faces: [{ abilities: [activated([sacrificaTerrenoCusto], function* (c) { gainLife(c.g, c.you, 2, c.source); }, { text: 'Sacrifique um terreno: Você ganha 2 de vida.' })] }],
  rulings: {},
});
