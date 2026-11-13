// Concordant Crossroads — All creatures have haste.
import { anthem, defineCard, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Concordant Crossroads',
  faces: [{ abilities: [anthem(is.creature, () => [{ k: 'addKeyword', kw: 'haste' }], 'Todas as criaturas têm ímpeto.')] }],
  rulings: {
    1: 'regra geral: CR 702.10 — vale para as criaturas de todos os jogadores',
    2: 'regra geral: CR 704.5k — é um encantamento mundial: com dois no campo, o mais novo fica',
  },
});
