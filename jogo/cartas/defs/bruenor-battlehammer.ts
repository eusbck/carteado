// Bruenor Battlehammer
// Each creature you control gets +2/+0 for each Equipment attached to it.
// You may pay {0} rather than pay the equip cost of the first equip ability you activate each turn.
import { and, anthem, defineCard, is } from '../../motor/api.ts';
import { equipamentosEm, primeiroEquiparGratis, registraEquipar } from '../armaria.ts';

export default defineCard({
  name: 'Bruenor Battlehammer',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours), (c, o) => [{ k: 'pt', p: 2 * equipamentosEm(c.g, o.id).length, t: 0 }],
        'Cada criatura que você controla recebe +2/+0 para cada Equipamento anexado a ela.'),
      registraEquipar(),
      primeiroEquiparGratis(false, 'Você pode pagar {0} em vez do custo de equipar da primeira habilidade de equipar que ativar em cada turno.'),
    ],
  }],
  rulings: {},
});
