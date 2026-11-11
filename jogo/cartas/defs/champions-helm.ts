// Champion's Helm
// Equipped creature gets +2/+2.
// As long as equipped creature is legendary, it has hexproof. (It can't be the target of spells or abilities your
// opponents control.)
// Equip {1}
import { attachedGets, chars, defineCard, equip, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Champion's Helm",
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }], 'A criatura equipada recebe +2/+2.'),
      // CR 702.11b: resistência a magia vale contra os oponentes de quem controla a criatura, não do Equipamento (ruling 1)
      // a lendária é conferida em `affects` (camada 6, depois dos tipos da camada 4): `mods` precisa sempre dizer a camada
      staticAbility({
        affects: (c, o) => c.g.state.objects[c.source]?.attachedTo === o.id && chars(c.g, o.id).supertypes.includes('Legendary'),
        mods: () => [{ k: 'addKeyword', kw: 'hexproof' }],
        text: 'Enquanto a criatura equipada for lendária, ela tem resistência a magia.',
      }),
      equip('{1}'),
    ],
  }],
  rulings: {
    1: 'teste: anexado à criatura lendária de um oponente, você é quem não pode escolhê-la como alvo',
  },
});
