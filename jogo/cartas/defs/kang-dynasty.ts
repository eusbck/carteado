// Kang Dynasty
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I, II — For each opponent, tap up to one target creature that player controls. Goad those creatures. Until your next
// turn, whenever any of those creatures deals combat damage to a player, draw a card.
// III — Target creature you control gets +1/+1 until end of turn for each card in your hand and can't be blocked this
// turn.
import { chapter, defineAbility, defineCard, delayed, draw, goad, is, sagaEnters, t, tap, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { umaPorOponente } from '../viloes.ts';

// "até o seu próximo turno": deixa de valer quando começa um turno seu depois daquele em que foi criado
const COMPRA = defineAbility('Kang Dynasty:compra', triggered({
  kind: 'event',
  match: (e, c) => {
    const d = (c as unknown as { delayed?: { createdTurn: number; data: Record<string, unknown> } }).delayed;
    if (!d || e.type !== 'damage' || !e.combat || e.target.kind !== 'player') return false;
    if (c.g.state.turn.active === c.you && c.g.state.turn.number > d.createdTurn) return false;
    return ((d.data.ids as ObjId[] | undefined) ?? []).includes(e.source);
  },
}, function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Até o seu próximo turno, sempre que uma dessas criaturas causar dano de combate a um jogador, compre uma carta.' }));

export default defineCard({
  name: 'Kang Dynasty',
  faces: [{
    abilities: [
      // CR 714.3a
      sagaEnters(),
      chapter([1, 2], function* (c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield' ? [r.id] : []));
        if (!ids.length) return;
        for (const id of ids) tap(c.g, id);
        for (const id of ids) goad(c.g, id, c.you);
        delayed(c, COMPRA.id!, { once: false, data: { ids } });
      }, {
        targets: [umaPorOponente('para cada oponente, até uma criatura alvo que esse jogador controla')],
        text: 'I, II — Para cada oponente, vire até uma criatura alvo que esse jogador controla. Goade essas criaturas. Até o seu próximo turno, sempre que uma delas causar dano de combate a um jogador, compre uma carta.',
      }),
      chapter([3], function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const n = c.g.state.zones.hand[c.you].length;
        untilEndOfTurn(c, [id], [{ k: 'pt', p: n, t: n }, { k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'III — A criatura alvo que você controla recebe +1/+1 até o fim do turno para cada carta na sua mão e não pode ser bloqueada neste turno.' }),
    ],
  }],
  rulings: {},
});
