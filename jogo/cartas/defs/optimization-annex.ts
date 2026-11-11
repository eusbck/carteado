// Optimization Annex
// If one or more charge counters would be put on an artifact you control, that many plus one charge counters are put
// on it instead.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Optimization Annex',
  faces: [{
    abilities: [
      // CR 614.1a: substituição; vale também para quem entra com marcadores de carga (CR 122.6)
      staticAbility({
        rules: { countersBonus: (c, kind, perm) => (kind === 'charge' && perm.controller === c.you && perm.chars.types.includes('Artifact') ? 1 : 0) },
        text: 'Se um ou mais marcadores de carga fossem ser colocados num artefato que você controla, em vez disso essa quantidade mais um é colocada nele.',
      }),
    ],
  }],
  rulings: {},
});
