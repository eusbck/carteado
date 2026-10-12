// Dawn's Truce
// Gift a card (You may promise an opponent a gift as you cast this spell. If you do, they draw a card before its other
// effects.)
// You and permanents you control gain hexproof until end of turn. If the gift was promised, permanents you control also
// gain indestructible until end of turn.
import { controllerOf, defineCard, giftCard, ruleEffect, untilEndOfTurn } from '../../motor/api.ts';

const PRESENTE = 'regra geral: CR 702.174 — o presente é prometido a um oponente ao conjurar e dado quando a mágica resolve, antes dos outros efeitos (motor/dsl.ts giftCard)';

export default defineCard({
  name: "Dawn's Truce",
  faces: [{
    // CR 702.174: o oponente do presente é escolhido ao conjurar e compra antes dos outros efeitos
    gift: giftCard(),
    spell: {
      *effect(c) {
        ruleEffect(c, 'rule:playerHexproof', { kind: 'endOfTurn' }, { players: [c.you] });
        // CR 611.2c: valem as permanentes que você controla na resolução
        const ids = c.g.state.zones.battlefield.filter((id) => controllerOf(c.g, id) === c.you);
        if (!ids.length) return;
        untilEndOfTurn(c, ids, c.paid.gift ? [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }] : [{ k: 'addKeyword', kw: 'hexproof' }]);
      },
    },
  }],
  rulings: {
    1: PRESENTE,
    2: 'não se aplica: Dawn\'s Truce é instantânea, não permanente',
    3: 'teste: com o presente prometido, o oponente compra e as suas permanentes ganham também indestrutível',
    4: 'regra geral: CR 702.174 — se a mágica for anulada ou não resolver, o presente não é dado (motor/dsl.ts giftCard)',
    5: 'regra geral: CR 702.174 — o custo de presente só pode ser pago uma vez (motor/dsl.ts giftCard)',
    6: 'regra geral: CR 707.10 — a cópia da mágica tem o presente prometido ao mesmo oponente (motor/stack.ts)',
    7: 'não se aplica: Dawn\'s Truce não tem alvos que dependam do presente',
    8: PRESENTE,
  },
});