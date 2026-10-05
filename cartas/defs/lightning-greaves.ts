// Lightning Greaves
// Equipped creature has haste and shroud. (It can't be the target of spells or abilities.)
// Equip {0}
import { attachedGets, defineCard, equip } from '../../motor/api.ts';

export default defineCard({
  name: 'Lightning Greaves',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'haste' }, { k: 'addKeyword', kw: 'shroud' }], 'A criatura equipada tem ímpeto e manto.'),
      equip('{0}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 302.6 — perder o ímpeto antes de atacar impede o ataque',
    2: 'teste: com manto, não pode ser alvo nem para mover o equipamento de volta',
  },
});
