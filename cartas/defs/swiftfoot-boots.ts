// Swiftfoot Boots — Equipped creature has hexproof and haste. Equip {1}
import { attachedGets, defineCard, equip } from '../../motor/api.ts';

export default defineCard({
  name: 'Swiftfoot Boots',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'haste' }], 'A criatura equipada tem resistência a magia e ímpeto.'),
      equip('{1}'),
    ],
  }],
});
