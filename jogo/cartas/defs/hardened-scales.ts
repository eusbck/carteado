// Hardened Scales
// If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on it
// instead.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Hardened Scales',
  faces: [{
    abilities: [
      // CR 614.1a: substituição; vale também para a criatura que entra com marcadores (CR 614.1c, ruling 1)
      staticAbility({
        rules: { countersBonus: (c, tipo, perm) => (tipo === '+1/+1' && perm.controller === c.you && perm.chars.types.includes('Creature') ? 1 : 0) },
        text: 'Se um ou mais marcadores +1/+1 fossem ser colocados numa criatura que você controla, em vez disso são colocados nela esses marcadores mais um.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura que entraria com marcadores +1/+1 entra com um a mais',
    2: 'regra geral: CR 616.1 — com várias substituições, o motor soma antes de dobrar, a ordem que mais rende ao controlador (motor/actions.ts countersAfterReplacements)',
    3: 'teste: com duas Hardened Scales, dois marcadores a mais',
  },
});
