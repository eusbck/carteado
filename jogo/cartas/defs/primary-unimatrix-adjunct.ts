// Primary Unimatrix Adjunct
// Artifact creatures you control have double strike.
import { and, anthem, defineCard, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Primary Unimatrix Adjunct',
  faces: [{ abilities: [anthem(and(is.creature, is.artifact, is.yours), () => [{ k: 'addKeyword', kw: 'double strike' }], 'As criaturas-artefato que você controla têm golpe duplo.')] }],
  rulings: {},
});
