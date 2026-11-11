// Brotherhood Regalia
// Equipped creature has ward {2}, is an Assassin in addition to its other types, and can't be blocked.
// Equip legendary creature {1}
// Equip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)
import { and, attachedGets, defineCard, equip, is, t, wardGranted } from '../../motor/api.ts';

export default defineCard({
  name: 'Brotherhood Regalia',
  faces: [{
    abilities: [
      attachedGets(() => [
        { k: 'addKeyword', kw: 'ward', param: '{2}' }, { k: 'addAbility', id: wardGranted('{2}') },
        { k: 'addTypes', subtypes: ['Assassin'] }, { k: 'addKeyword', kw: 'unblockable' },
      ], 'A criatura equipada tem resguardo {2}, é um Assassin além de seus outros tipos e não pode ser bloqueada.'),
      // CR 702.6c: variante "Equipar criatura lendária"
      { ...equip('{1}'), targets: [t.creature(and(is.yours, is.legendary), 'criatura lendária alvo que você controla')], text: 'Equipar criatura lendária {1}' },
      equip('{3}'),
    ],
  }],
  rulings: {},
});
