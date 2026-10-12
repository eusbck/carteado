// Hero's Blade
// Equipped creature gets +3/+2.
// Whenever a legendary creature you control enters, you may attach this Equipment to it.
// Equip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)
import { and, attach, attachedGets, defineCard, equip, is, isCreature, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: "Hero's Blade",
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 3, t: 2 }], 'A criatura equipada recebe +3/+2.'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && and(is.creature, is.yours, is.legendary)(c, e.obj) ? { criatura: e.obj } : false)), function* (c) {
        const id = c.event.criatura as number;
        // ruling 1: se a criatura já saiu do campo (ou deixou de ser criatura), a lâmina fica como estava
        if (c.g.state.objects[c.source]?.zone !== 'battlefield' || c.g.state.objects[id]?.zone !== 'battlefield' || !isCreature(c.g, id)) return;
        if (yield* yesNo(c.g, c.you, "Hero's Blade: anexar à criatura lendária que entrou?")) attach(c.g, c.source, id);
      }, { text: 'Sempre que uma criatura lendária que você controla entra, você pode anexar este Equipamento a ela.' }),
      equip('{4}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — se a criatura lendária já saiu do campo quando o gatilho resolve, a lâmina fica onde estava (cartas/defs/heros-blade.ts)',
    2: 'regra geral: CR 704.5n — presa a algo que deixou de ser criatura, a lâmina se solta (motor/sba.ts)',
  },
});