// Corpsejack Menace
// If one or more +1/+1 counters would be put on a creature you control, twice that many +1/+1 counters are put on it
// instead.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Corpsejack Menace',
  faces: [{
    abilities: [
      // ruling 1: vale também para o que entra com marcadores; ruling 2: dois Corpsejack quadruplicam
      staticAbility({
        rules: { countersDouble: (c, tipo, perm) => tipo === '+1/+1' && perm.controller === c.you && perm.chars.types.includes('Creature') },
        text: 'Se um ou mais marcadores +1/+1 fossem ser colocados numa criatura que você controla, em vez disso é colocado nela o dobro desses marcadores +1/+1.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura que entraria com marcadores +1/+1 entra com o dobro',
    2: 'teste: dois Corpsejack Menace quadruplicam os marcadores',
  },
});