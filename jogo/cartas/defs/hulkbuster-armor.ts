// Hulkbuster Armor
// Equipped creature has base power and toughness 9/9 and has flying.
// Equip Hero {3}
// Equip {6}
import { and, attachedGets, defineCard, equip, is, t } from '../../motor/api.ts';
import { ehHeroi } from '../vingadores.ts';

export default defineCard({
  name: 'Hulkbuster Armor',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'setPT', p: 9, t: 9 }, { k: 'addKeyword', kw: 'flying' }], 'A criatura equipada tem força e resistência base 9/9 e tem voar.'),
      // CR 702.6c: equipar com restrição no alvo
      { ...equip('{3}'), targets: [t.creature(and(is.yours, (c, id) => ehHeroi(c.g, id)), 'Hero alvo que você controla')], text: 'Equipar Hero {3}' },
      equip('{6}'),
    ],
  }],
  rulings: {},
});