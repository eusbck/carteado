// Skyclave Shade
// Kicker {2}{B}
// This creature can't block.
// If this creature was kicked, it enters with two +1/+1 counters on it.
// Landfall — Whenever a land you control enters, if this card is in your graveyard and it's your turn, you may cast it
// from your graveyard this turn.
import { additionalCost, allowPlay, defineCard, entersWithCounters, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Skyclave Shade',
  faces: [{
    // CR 702.33a: custo adicional opcional, pago uma vez
    additionalCosts: [additionalCost('kicker', 'kicker {2}{B}', [{ k: 'mana', cost: '{2}{B}' }], { optional: true })],
    abilities: [
      { ...keyword('cantBlock'), text: 'Esta criatura não pode bloquear.' },
      // rulings 7 e 9 (CR 702.33d): só a mágica conjurada foi reforçada
      entersWithCounters('+1/+1', (_c, ev) => (ev.spell?.paid.kicker ? 2 : 0)),
      // aterrissagem (palavra de habilidade, CR 207.2c); ruling 12: só dispara com a carta já no seu cemitério
      triggered(on.landfall(), function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o || o.zone !== 'graveyard') return;
        // rulings 10-11: paga os custos (pode reforçar), no tempo normal; a permissão é deste objeto e acaba no fim do turno
        allowPlay(c.g, c.you, c.source, [c.source], { kind: 'endOfTurn' }, { spellsOnly: true });
      }, {
        zones: ['graveyard'],
        // CR 603.4: cláusula "se" interveniente
        condition: (c) => c.g.state.objects[c.source]?.zone === 'graveyard' && c.g.state.turn.active === c.you,
        text: 'Aterrissagem — Sempre que um terreno que você controla entra, se esta carta estiver no seu cemitério e for o seu turno, você pode conjurá-la do seu cemitério neste turno.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3b — os gatilhos de aterrissagem vão para a pilha na ordem que você escolher (motor/triggers.ts)',
    2: 'regra geral: CR 601.2f — o custo total soma os custos adicionais (motor/stack.ts totalSpellCost)',
    3: 'teste: no cemitério, um terreno seu entrando no seu turno permite conjurá-la do cemitério neste turno',
    4: 'regra geral: CR 603.6a — só dispara quando um terreno entra, não quando algo vira terreno (motor/dsl.ts on.landfall)',
    5: 'teste: reforçada, entra com dois marcadores +1/+1',
    6: 'regra geral: CR 702.33a — o kicker é pago uma vez (motor/stack.ts castInner)',
    7: 'teste: posta no campo sem ser conjurada, entra sem marcadores',
    8: 'regra geral: CR 707.10 — a cópia de uma mágica copia as decisões, inclusive ter sido reforçada (motor/stack.ts copySpell)',
    9: 'teste: posta no campo sem ser conjurada, entra sem marcadores',
    10: 'teste: do cemitério também pode ser reforçada, pagando os custos',
    11: 'teste: depois de conjurada do cemitério, a permissão não vale para ela de novo',
    12: 'teste: no turno do oponente, ou com a carta fora do cemitério, a aterrissagem não dispara',
  },
});
