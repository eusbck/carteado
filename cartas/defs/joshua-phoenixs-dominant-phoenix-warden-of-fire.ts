// Joshua, Phoenix's Dominant // Phoenix, Warden of Fire
// Joshua — When Joshua enters, discard up to two cards, then draw that many cards.
// {3}{R}{W}, {T}: Exile Joshua, then return it to the battlefield transformed under its owner's control. Activate only as
// a sorcery.
// Phoenix, Warden of Fire (Saga) — (As this Saga enters and after your draw step, add a lore counter.)
// I, II — Rising Flames — Phoenix deals 2 damage to each opponent.
// III — Flames of Rebirth — Return any number of target creature cards with total mana value 6 or less from your graveyard
// to the battlefield. Exile Phoenix, then return it to the battlefield (front face up).
// Flying, lifelink
import { activated, chapter, dealDamage, defineCard, discard, draw, etb, exile, is, keywords, manaValue, putOntoBattlefield, sagaEnters, t } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

/** exila este permanente e o devolve ao campo sob o controle do dono, com a face pedida para cima */
function* exilaEVolta(c: Ctx, face: number) {
  const o = c.g.state.objects[c.source];
  if (!o || o.zone !== 'battlefield') return;
  const dono = o.owner;
  const [ex] = yield* exile(c.g, [c.source]);
  // CR 712.14: volta com a face pedida; ficha ou carta que não é de dupla face não voltaria transformada (ruling 8)
  if (ex !== null && ex !== undefined && c.g.state.objects[ex]?.zone === 'exile') yield* putOntoBattlefield(c.g, [{ id: ex, controller: dono, face }], 'effect');
}

export default defineCard({
  name: "Joshua, Phoenix's Dominant // Phoenix, Warden of Fire",
  faces: [
    {
      abilities: [
        // ruling 5: pode descartar nenhuma; compra o mesmo número
        etb(function* (c) {
          const descartadas = yield* discard(c.g, c.you, 2, { upTo: true });
          if (descartadas.length) yield* draw(c.g, c.you, descartadas.length);
        }, { text: 'Quando Joshua entra, descarte até duas cartas e depois compre essa quantidade.' }),
        activated('{3}{R}{W}, {T}', function* (c) { yield* exilaEVolta(c, 1); }, {
          timing: 'sorcery',
          text: '{3}{R}{W}, {T}: Exile Joshua e depois devolva-o ao campo transformado sob o controle do dono. Ative só como feitiço.',
        }),
      ],
    },
    {
      abilities: [
        sagaEnters(),
        chapter([1, 2], function* (c) {
          dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 2, combat: false })));
        }, { text: 'I, II — Chamas Ascendentes: Phoenix causa 2 de dano a cada oponente.' }),
        chapter([3], function* (c) {
          const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'graveyard' ? [r.id as ObjId] : []));
          // CR 608.2b: soma conferida de novo na resolução
          if (ids.length && ids.reduce((s, id) => s + manaValue(c.g, id), 0) <= 6) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you })), 'effect');
          yield* exilaEVolta(c, 0);
        }, {
          // ruling 7: X vale 0 no cemitério
          targets: [{ ...t.card('graveyard', is.creature, 'cartas de criatura alvo com valor de mana total 6 ou menos'), min: 0, max: 99, validateSet: (c, alvos) => alvos.reduce((s, r) => s + (r.kind === 'obj' && c.g.state.objects[r.id] ? manaValue(c.g, r.id) : 0), 0) <= 6 }],
          text: 'III — Chamas do Renascimento: Devolva qualquer número de cartas de criatura alvo com valor de mana total 6 ou menos do seu cemitério ao campo. Exile Phoenix e depois devolva-a ao campo (com a frente para cima).',
        }),
        ...keywords('flying', 'lifelink'),
      ],
    },
  ],
  rulings: {
    1: 'teste: a carta entra com a frente para cima, a menos que mandem voltar transformada',
    2: 'regra geral: CR 712.8 — a face de trás tem indicador de cor',
    3: 'regra geral: CR 903.4 — identidade de cor soma as duas faces (motor/deck.ts)',
    4: 'regra geral: CR 712.8a — fora do campo, só a frente',
    5: 'teste: pode descartar nenhuma; compra o mesmo número',
    6: 'regra geral: CR 707.8 — ficha cópia de dupla face também tem as duas faces',
    7: 'regra geral: CR 202.3e — X vale 0 no cemitério',
    8: 'regra geral: CR 712.14 — o que não é de dupla face não entra transformado',
    9: 'regra geral: CR 712.8d — no campo, só a face para cima',
    10: 'regra geral: CR 712.8e — o valor de mana é o da frente',
  },
});
