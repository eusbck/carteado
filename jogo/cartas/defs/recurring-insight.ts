// Recurring Insight
// Draw cards equal to the number of cards in target opponent's hand.
// Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may
// cast this card from exile without paying its mana cost.)
import { defineCard, draw, rebound, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Recurring Insight',
  faces: [{
    // CR 702.88a
    abilities: [rebound()],
    spell: {
      targets: [t.opponent()],
      *effect(c) {
        const p = tgtPlayer(c, 0);
        if (p === null) return;
        const n = c.g.state.zones.hand[p].length;
        if (n > 0) yield* draw(c.g, c.you, n);
      },
    },
  }],
  rulings: {
    1: 'teste: anulada, vai para o cemitério e o ricochete não acontece',
    2: 'teste: conjurada do exílio pelo ricochete, vai para o cemitério e não ricocheteia de novo',
    3: 'não se aplica: nenhum deck da mesa substitui a ida de mágicas para o cemitério',
    4: 'regra geral: CR 707.10 — cópias de mágicas não são conjuradas da mão (motor/stack.ts copySpell)',
    5: 'teste: CR 702.88a: conjurada da mão, é exilada ao resolver em vez de ir para o cemitério',
    6: 'teste: conjurada do exílio pelo ricochete, vai para o cemitério e não ricocheteia de novo',
    7: 'teste: recusando o ricochete, a carta fica exilada e não há outra chance',
    8: 'teste: conjurada do exílio pelo ricochete, vai para o cemitério e não ricocheteia de novo',
  },
});
