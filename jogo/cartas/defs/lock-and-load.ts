// Lock and Load
// Draw a card, then draw a card for each other instant and sorcery spell you've cast this turn.
// Plot {3}{U} (You may pay {3}{U} and exile this card from your hand. Cast it as a sorcery on a later turn without
// paying its mana cost. Plot only as a sorcery.)
import { defineCard, draw, plot } from '../../motor/api.ts';

const planejar = plot('{3}{U}');

export default defineCard({
  name: 'Lock and Load',
  faces: [{
    // CR 702.170: ação especial de planejar (motor/planejar.ts) e conjurar a carta planejada sem pagar
    altCosts: [planejar.altCost],
    abilities: [planejar.ability],
    spell: {
      *effect(c) {
        // ruling 1: contam as instantâneas e feitiços conjurados no turno, resolvidos ou não; esta não conta, mas uma
        // cópia dela não foi conjurada (CR 707.10) e então todas as conjuradas são "outras"
        const conjuradas = c.g.state.turnStats[c.you]?.instantSorceryCast ?? 0;
        const estaFoiConjurada = !c.g.state.objects[c.source]?.isCopy;
        const outras = Math.max(0, conjuradas - (estaFoiConjurada ? 1 : 0));
        yield* draw(c.g, c.you, 1 + outras);
      },
    },
  }],
  rulings: {
    1: 'teste: compra uma carta mais uma para cada outra instantânea ou feitiço conjurado no turno, inclusive a anulada',
    2: 'regra geral: CR 702.170a — planejar paga o custo e exila da mão (motor/planejar.ts; testes/regras-planejar.test.ts)',
    3: 'regra geral: CR 702.170b — planejar é ação especial, sem a pilha (testes/regras-planejar.test.ts)',
    4: 'teste: planejada, só pode ser conjurada num turno posterior, de graça, na fase principal com a pilha vazia',
    5: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe outro custo alternativo; custos adicionais continuam (motor/stack.ts)',
    6: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts, AltCastDef.free)',
  },
});
