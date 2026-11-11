// Darksteel Plate
// Indestructible
// Equipped creature has indestructible.
// Equip {2}
import { attachedGets, defineCard, equip, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Darksteel Plate',
  faces: [{
    abilities: [
      keyword('indestructible'),
      attachedGets(() => [{ k: 'addKeyword', kw: 'indestructible' }], 'A criatura equipada tem indestrutível.'),
      equip('{2}'),
    ],
  }],
  rulings: {},
});
