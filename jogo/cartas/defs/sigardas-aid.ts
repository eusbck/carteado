// Sigarda's Aid
// You may cast Aura and Equipment spells as though they had flash.
// Whenever an Equipment you control enters, you may attach it to target creature you control.
import { and, attach, chars, defineCard, is, on, staticAbility, t, tgt, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: "Sigarda's Aid",
  faces: [{
    abilities: [
      staticAbility({
        rules: { castAsThoughFlash: (c, jogador, carta) => jogador === c.you && chars(c.g, carta).subtypes.some((s) => s === 'Aura' || s === 'Equipment') },
        text: 'Você pode conjurar mágicas de Aura e de Equipamento como se tivessem lampejo.',
      }),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && and(is.yours, is.subtype('Equipment'))(c, e.obj) ? { equipamento: e.obj } : false)), function* (c) {
        const criatura = tgt(c);
        const eq = c.event.equipamento as number;
        if (criatura === null || c.g.state.objects[eq]?.zone !== 'battlefield') return;
        if (yield* yesNo(c.g, c.you, "Sigarda's Aid: anexar o Equipamento à criatura alvo?")) attach(c.g, eq, criatura);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Sempre que um Equipamento que você controla entra, você pode anexá-lo à criatura alvo que você controla.' }),
    ],
  }],
  rulings: {},
});