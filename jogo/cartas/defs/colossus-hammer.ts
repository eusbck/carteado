// Colossus Hammer
// Equipped creature gets +10/+10 and loses flying.
// Equip {8} ({8}: Attach to target creature you control. Equip only as a sorcery.)
import { attachedGets, defineCard, equip } from '../../motor/api.ts';

export default defineCard({
  name: 'Colossus Hammer',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 10, t: 10 }, { k: 'loseKeyword', kw: 'flying' }], 'A criatura equipada recebe +10/+10 e perde voar.'),
      equip('{8}'),
    ],
  }],
  rulings: {
    1: 'teste: ruling 1: pode equipar criatura sem voar; ela só não perde nada',
    2: 'teste: ruling 2: voar ganho depois de o Hammer ser anexado fica (camada 6, ordem de carimbo)',
    3: 'regra geral: CR 613.7 — habilidade "tem voar enquanto…" da própria criatura tem o carimbo dela e perde para o Hammer (motor/layers)',
  },
});
