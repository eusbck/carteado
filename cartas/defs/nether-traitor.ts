// Nether Traitor
// Haste
// Shadow (This creature can block or be blocked by only creatures with shadow.)
// Whenever another creature is put into your graveyard from the battlefield, you may pay {B}. If you do, return this card
// from your graveyard to the battlefield.
import { defineCard, keywords, mayPay, on, putOntoBattlefield, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Nether Traitor',
  faces: [{
    abilities: [
      ...keywords('haste', 'shadow'),
      triggered(on.batch((evs, c) => {
        // ruling 6: se ela chegou ao cemitério no mesmo lote, não estava lá para disparar
        if (evs.some((e) => e.type === 'zone' && e.obj === c.source)) return false;
        const s = c.g.state;
        // rulings 3-4: um gatilho por criatura (fichas suas também passam pelo cemitério)
        return evs.filter((e) => e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.owner === c.you && !!s.lki[e.old]?.chars.types.includes('Creature'))
          .map(() => ({}));
      }), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
        if (yield* mayPay(c, c.you, '{B}', 'devolver Nether Traitor ao campo')) {
          if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you }], 'effect');
        }
      }, { zones: ['graveyard'], text: 'Sempre que outra criatura vai do campo para o seu cemitério, você pode pagar {B}. Se fizer isso, devolva esta carta do seu cemitério ao campo.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1h — depois de bloqueada, continua bloqueada',
    2: 'regra geral: CR 702.28c — instâncias redundantes',
    3: 'teste: duas criaturas ao mesmo tempo disparam duas vezes; volta só uma vez',
    4: 'regra geral: CR 111.7 — a ficha vai ao cemitério antes de deixar de existir',
    5: 'regra geral: CR 509.1b — todas as evasões se aplicam',
    6: 'teste: morrendo junto com outra criatura, não dispara',
  },
});
