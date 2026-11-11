// Colossus Hammer
// Equipped creature gets +10/+10 and loses flying.
// Equip {8} ({8}: Attach to target creature you control. Equip only as a sorcery.)
import { attachedGets, defineCard, equip } from '../../motor/api.ts';

export default defineCard({
  name: 'Colossus Hammer',
  faces: [{
    abilities: [
      // camadas 6 e 7c (CR 613.1f, 613.4c); "perde voar" segue a ordem de registro de data e hora (CR 613.7)
      attachedGets(() => [{ k: 'pt', p: 10, t: 10 }, { k: 'loseKeyword', kw: 'flying' }], 'A criatura equipada recebe +10/+10 e perde voar.'),
      equip('{8}'),
    ],
  }],
  rulings: {
    1: 'teste: equipar {8}: a criatura equipada recebe +10/+10; sem voar, continua sem voar',
    2: 'teste: CR 613.7: voar ganho depois de equipar fica',
    3: 'teste: CR 613.7a: o voar "enquanto" da própria criatura (Cid, durante o seu turno) é perdido',
  },
});
