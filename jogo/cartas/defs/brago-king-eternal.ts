// Brago, King Eternal
// Flying
// Whenever Brago deals combat damage to a player, exile any number of target nonland permanents you control, then
// return those cards to the battlefield under their owner's control.
import { defineCard, exile, is, keyword, on, putOntoBattlefield, t, triggered, upTo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Brago, King Eternal',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const ids = (c.targets[0] ?? []).flatMap((x) => (x && x.kind === 'obj' && c.g.state.objects[x.id]?.zone === 'battlefield' ? [x.id] : []));
        if (!ids.length) return;
        const donos = new Map(ids.map((id) => [id, c.g.state.objects[id].owner]));
        const ex = yield* exile(c.g, ids);
        const volta: { id: ObjId; controller: number }[] = [];
        ex.forEach((nid, i) => { if (nid !== null && c.g.state.objects[nid]?.zone === 'exile') volta.push({ id: nid, controller: donos.get(ids[i])! }); });
        // CR 610.3: voltam todos juntos
        if (volta.length) yield* putOntoBattlefield(c.g, volta, 'effect');
      }, {
        targets: [upTo(99, t.nonlandPermanent(is.yours, 'permanentes não terreno alvo que você controla'))],
        text: 'Sempre que Brago causa dano de combate a um jogador, exile qualquer número de permanentes não terreno alvo que você controla e depois devolva essas cartas ao campo de batalha sob o controle de seus donos.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 400.7 — voltam como objetos novos (motor/actions.ts)',
    2: 'regra geral: CR 111.7 — fichas exiladas não voltam (motor/sba.ts)',
    3: 'regra geral: CR 303.4f — Auras que voltam são presas a algo, sem mirar (motor/actions.ts)',
  },
});
