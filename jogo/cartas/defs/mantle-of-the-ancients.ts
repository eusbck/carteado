// Mantle of the Ancients
// Enchant creature you control
// When this Aura enters, return any number of target Aura and/or Equipment cards from your graveyard to the battlefield
// attached to enchanted creature.
// Enchanted creature gets +1/+1 for each Aura and Equipment attached to it.
import { attachedGets, chars, defineCard, etb, is, putOntoBattlefield, t, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Mantle of the Ancients',
  faces: [{
    enchant: t.creature(is.yours, 'criatura que você controla'),
    abilities: [
      etb(function* (c) {
        // rulings 2 e 3: a "criatura encantada" é aquela a que a Aura está (ou esteve por último) anexada ao resolver
        const criatura = (c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj)?.attachedTo ?? null;
        if (criatura === null || c.g.state.objects[criatura]?.zone !== 'battlefield') return;
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'graveyard' ? [r.id] : []));
        // ruling 1: as que não puderem ser anexadas a ela ficam no cemitério (o motor recusa a entrada)
        if (ids.length) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you, attachTo: criatura })), 'effect');
      }, {
        targets: [upTo(99, t.card('graveyard', (c, id) => chars(c.g, id).subtypes.some((s) => s === 'Aura' || s === 'Equipment'), 'cartas de Aura e/ou de Equipamento alvo no seu cemitério'))],
        text: 'Quando esta Aura entra, devolva qualquer número de cartas de Aura e/ou de Equipamento alvo do seu cemitério ao campo de batalha anexadas à criatura encantada.',
      }),
      attachedGets((c) => {
        const criatura = c.g.state.objects[c.source]?.attachedTo ?? null;
        if (criatura === null) return [];
        const n = c.g.state.zones.battlefield.filter((id) => c.g.state.objects[id].attachedTo === criatura && chars(c.g, id).subtypes.some((s) => s === 'Aura' || s === 'Equipment')).length;
        return n > 0 ? [{ k: 'pt', p: n, t: n }] : [];
      }, 'A criatura encantada recebe +1/+1 para cada Aura e Equipamento anexados a ela.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 303.4g — a Aura ou o Equipamento que não pode ser anexado à criatura fica no cemitério (motor/actions.ts putOntoBattlefield)',
    2: 'regra geral: CR 608.2h — vale a criatura a que a Aura está anexada quando a habilidade resolve (cartas/defs/mantle-of-the-ancients.ts)',
    3: 'regra geral: CR 608.2h — se a Aura já saiu do campo, vale a última permanente a que esteve anexada (cartas/defs/mantle-of-the-ancients.ts)',
  },
});