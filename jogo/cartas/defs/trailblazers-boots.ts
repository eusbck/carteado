// Trailblazer's Boots
// Equipped creature has nonbasic landwalk. (It can't be blocked as long as defending player controls a nonbasic land.)
// Equip {2}
import { attachedGets, chars, controlledBy, controllerOf, defineCard, equip, isLand, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Trailblazer's Boots",
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'nonbasic landwalk' }], 'A criatura equipada tem passo em terreno não básico.'),
      // CR 702.14c: não pode ser bloqueada enquanto o jogador defensor controlar um terreno não básico
      staticAbility({
        rules: {
          canBeBlockedBy: (c, atacante, bloqueador) => c.g.state.objects[c.source]?.attachedTo !== atacante
            || controlledBy(c.g, controllerOf(c.g, bloqueador), (id) => isLand(c.g, id) && !chars(c.g, id).supertypes.includes('Basic')).length === 0,
        },
      }),
      equip('{2}'),
    ],
  }],
  rulings: {},
});
