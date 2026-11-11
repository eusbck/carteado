// Loxodon Warhammer
// Equipped creature gets +3/+0 and has trample and lifelink.
// Equip {3}
import { attachedGets, defineCard, equip } from '../../motor/api.ts';

export default defineCard({
  name: 'Loxodon Warhammer',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 3, t: 0 }, { k: 'addKeyword', kw: 'trample' }, { k: 'addKeyword', kw: 'lifelink' }], 'A criatura equipada recebe +3/+0 e tem atropelar e vínculo com a vida.'),
      equip('{3}'),
    ],
  }],
  rulings: {},
});
