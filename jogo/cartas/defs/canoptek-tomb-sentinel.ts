// Canoptek Tomb Sentinel
// Vigilance
// Exile Cannon — When this creature enters from a graveyard, exile up to one target nonland permanent.
// Unearth {7} ({7}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of
// the next end step or if it would leave the battlefield. Unearth only as a sorcery.)
import { defineCard, exile, keyword, on, t, triggered, unearth, upTo } from '../../motor/api.ts';
import { DESENTERRAR } from '../necrons.ts';

export default defineCard({
  name: 'Canoptek Tomb Sentinel',
  faces: [{
    abilities: [
      keyword('vigilance'),
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && e.from === 'graveyard' && e.obj === c.source), function* (c) {
        const r = c.targets[0]?.[0];
        if (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield') yield* exile(c.g, [r.id]);
      }, { targets: [upTo(1, t.nonlandPermanent())], text: 'Exile Cannon — Quando esta criatura entra vinda de um cemitério, exile até uma permanente alvo que não é terreno.' }),
      unearth('{7}'),
    ],
  }],
  rulings: {
    1: DESENTERRAR.sumiu,
    2: DESENTERRAR.naoMagica,
    3: DESENTERRAR.sairia,
    4: DESENTERRAR.etapaFinal,
    5: DESENTERRAR.impeto,
  },
});