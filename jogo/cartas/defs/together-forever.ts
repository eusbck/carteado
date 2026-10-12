// Together Forever
// When this enchantment enters, support 2. (Put a +1/+1 counter on each of up to two target creatures.)
// {1}: Choose target creature with a counter on it. When that creature dies this turn, return that card to its owner's
// hand.
import { activated, addCounters, defineAbility, defineCard, delayed, etb, moveObjects, on, t, triggered, upTo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { temMarcador } from '../tartarugas.ts';

// ruling 1: a criatura só precisa ter marcador ao ativar e ao resolver; perdendo-os depois, ainda volta
const VOLTA = defineAbility('Together Forever:volta', triggered(on.custom((e, c) => {
  const criatura = (c as unknown as { delayed?: { data: { criatura?: ObjId } } }).delayed?.data.criatura;
  return e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === criatura ? { carta: e.obj } : false;
}), function* (c) {
  const carta = c.event.carta as ObjId;
  if (c.g.state.objects[carta]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id: carta, to: 'hand' }], 'effect');
}, { text: 'Quando essa criatura morrer neste turno, devolva essa carta para a mão do dono.' }));

export default defineCard({
  name: 'Together Forever',
  faces: [{
    abilities: [
      // CR 701.41a: suporte 2 — um marcador +1/+1 em cada uma de até duas criaturas alvo (ruling 3: um por alvo)
      etb(function* (c) {
        for (const r of c.targets[0] ?? []) if (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: r.id }, '+1/+1', 1, c.you);
      }, { targets: [upTo(2, t.creature())], text: 'Quando este encantamento entra, suporte 2. (Coloque um marcador +1/+1 em cada uma de até duas criaturas alvo.)' }),
      activated('{1}', function* (c) {
        const r = c.targets[0]?.[0];
        if (!r || r.kind !== 'obj' || !temMarcador(c.g, r.id)) return;
        delayed(c, VOLTA.id!, { data: { criatura: r.id }, expiresTurn: c.g.state.turn.number });
      }, { targets: [t.creature((c, id) => temMarcador(c.g, id), 'criatura alvo com um marcador')], text: '{1}: Escolha a criatura alvo com um marcador. Quando essa criatura morrer neste turno, devolva essa carta para a mão do dono.' }),
    ],
  }],
  rulings: {
    1: 'teste: {1}: a criatura com marcador que morrer neste turno volta para a mão do dono',
    2: 'teste: suporte 2: um marcador +1/+1 em cada uma de até duas criaturas alvo, de qualquer jogador',
    3: 'regra geral: CR 701.41a — um marcador por alvo (cartas/defs/together-forever.ts)',
    4: 'regra geral: CR 608.2b — os alvos que ficaram ilegais não recebem marcador (motor/stack.ts)',
    5: 'não se aplica: Together Forever não tem outra habilidade que mire criaturas junto com o suporte',
    6: 'regra geral: CR 704.3 — a criatura com resistência 0 morre antes de alguém receber prioridade para ativar (motor/sba.ts)',
  },
});