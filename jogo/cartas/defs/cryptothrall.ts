// Cryptothrall
// Protector — Other artifact creatures you control have hexproof.
import { and, anthem, defineCard, is } from '../../motor/api.ts';
import { ehCriaturaArtefato } from '../necrons.ts';

export default defineCard({
  name: 'Cryptothrall',
  faces: [{
    abilities: [
      anthem(and(is.yours, is.other, (c, id) => ehCriaturaArtefato(c.g, id)), () => [{ k: 'addKeyword', kw: 'hexproof' }], 'Protector — As outras criaturas artefato que você controla têm resistência a magia.'),
    ],
  }],
  rulings: {},
});