// Whispersilk Cloak
// Equipped creature can't be blocked and has shroud. (It can't be the target of spells or abilities.)
// Equip {2}
import { attachedGets, defineCard, equip } from '../../motor/api.ts';

export default defineCard({
  name: 'Whispersilk Cloak',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'unblockable' }, { k: 'addKeyword', kw: 'shroud' }], 'A criatura equipada não pode ser bloqueada e tem manto.'),
      equip('{2}'),
    ],
  }],
  rulings: {},
});