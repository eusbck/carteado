// Basilisk Collar
// Equipped creature has deathtouch and lifelink.
// Equip {2}
import { attachedGets, defineCard, equip } from '../../motor/api.ts';

export default defineCard({
  name: 'Basilisk Collar',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'deathtouch' }, { k: 'addKeyword', kw: 'lifelink' }], 'A criatura equipada tem toque mortífero e vínculo com a vida.'),
      equip('{2}'),
    ],
  }],
  rulings: {},
});
