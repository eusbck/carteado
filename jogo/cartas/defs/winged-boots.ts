// Winged Boots
// Equipped creature has flying and ward {4}. (Whenever equipped creature becomes the target of a spell or ability an
// opponent controls, counter it unless that player pays {4}.)
// Equip {1}
import { attachedGets, defineCard, equip, wardGranted } from '../../motor/api.ts';

export default defineCard({
  name: 'Winged Boots',
  faces: [{
    abilities: [
      // CR 702.21a: o resguardo concedido é a palavra-chave e o gatilho dela (motor/mecanicas.ts wardGranted)
      attachedGets(() => [{ k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'ward', param: '{4}' }, { k: 'addAbility', id: wardGranted('{4}') }], 'A criatura equipada tem voar e resguardo {4}.'),
      equip('{1}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.21a — cada resguardo dispara separadamente (motor/mecanicas.ts)',
  },
});
