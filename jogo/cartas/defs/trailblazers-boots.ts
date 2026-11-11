// Trailblazer's Boots
// Equipped creature has nonbasic landwalk. (It can't be blocked as long as defending player controls a nonbasic land.)
// Equip {2}
import { attachedGets, chars, controllerOf, defineCard, equip, isLand, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Trailblazer's Boots",
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'nonbasic landwalk' }], 'A criatura equipada tem travessia de terreno não básico.'),
      // CR 702.14c: travessia de terreno não básico — não pode ser bloqueada enquanto o jogador defensor controla um
      // terreno sem o supertipo básico (CR 702.14b)
      staticAbility({
        rules: {
          canBeBlockedBy: (c, atacante, bloqueador) => {
            if (atacante !== c.g.state.objects[c.source]?.attachedTo) return true;
            const defensor = controllerOf(c.g, bloqueador);
            return !c.g.state.zones.battlefield.some((id) => !c.g.state.objects[id].phasedOut && controllerOf(c.g, id) === defensor && isLand(c.g, id) && !chars(c.g, id).supertypes.includes('Basic'));
          },
        },
        text: 'Travessia de terreno não básico (a criatura equipada não pode ser bloqueada enquanto o jogador defensor controlar um terreno não básico).',
      }),
      equip('{2}'),
    ],
  }],
  rulings: {},
});
