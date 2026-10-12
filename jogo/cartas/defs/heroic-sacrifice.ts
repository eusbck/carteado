// Heroic Sacrifice
// Choose target creature you control. Until end of turn, all damage that would be dealt to you and creatures you control
// is dealt to the chosen creature instead (if it's still on the battlefield). When that creature dies this turn, put its
// counters on up to one target creature you control and draw a card.
import { addCounters, defineAbility, defineCard, delayed, draw, is, on, ruleEffect, t, tgt, triggered, upTo } from '../../motor/api.ts';

const MORRE = defineAbility('Heroic Sacrifice:morre', triggered(on.custom((e, c) => {
  const criatura = (c as unknown as { delayed?: { data: { criatura?: number } } }).delayed?.data.criatura;
  return e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === criatura ? { morta: e.old } : false;
}), function* (c) {
  const para = tgt(c);
  // os marcadores de quando ela esteve no campo pela última vez
  const marcadores = c.g.state.lki[c.event.morta as number]?.obj.counters ?? {};
  if (para !== null) for (const [tipo, n] of Object.entries(marcadores)) if (n > 0) addCounters(c.g, { kind: 'obj', id: para }, tipo, n, c.you);
  yield* draw(c.g, c.you, 1);
}, {
  targets: [upTo(1, t.creature(is.yours, 'criatura alvo que você controla para receber os marcadores'))],
  text: 'Quando essa criatura morrer neste turno, coloque os marcadores dela em até uma criatura alvo que você controla e compre uma carta.',
}));

export default defineCard({
  name: 'Heroic Sacrifice',
  faces: [{
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // CR 614.9: redirecionamento; deixa de valer se a criatura sair do campo (motor/actions.ts redirectedDamage)
        ruleEffect(c, 'rule:redirectDamageTo', { kind: 'endOfTurn' }, { params: { controller: c.you, to: id } });
        delayed(c, MORRE.id!, { data: { criatura: id }, expiresTurn: c.g.state.turn.number });
      },
    },
  }],
  rulings: {},
});