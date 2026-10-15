// Pyretic Charge
// Discard your hand, then draw four cards. For each card discarded this way, creatures you control get +1/+0 until end
// of turn.
// Plot {3}{R} (You may pay {3}{R} and exile this card from your hand. Cast it as a sorcery on a later turn without
// paying its mana cost. Plot only as a sorcery.)
import { creaturesOf, defineCard, discard, draw, plot, untilEndOfTurn } from '../../motor/api.ts';

const planejar = plot('{3}{R}');

export default defineCard({
  name: 'Pyretic Charge',
  faces: [{
    // CR 702.170: ação especial de planejar (motor/planejar.ts) e conjurar a carta planejada sem pagar
    altCosts: [planejar.altCost],
    abilities: [planejar.ability],
    spell: {
      *effect(c) {
        const mao = c.g.state.zones.hand[c.you].length;
        const descartadas = mao > 0 ? (yield* discard(c.g, c.you, mao)).length : 0;
        yield* draw(c.g, c.you, 4);
        // ruling 3: só as criaturas que você controla agora
        if (descartadas > 0) untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'pt', p: descartadas, t: 0 }]);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.170a — planejar paga o custo e exila da mão (motor/planejar.ts; testes/regras-planejar.test.ts)',
    2: 'regra geral: CR 702.170b — planejar é ação especial, sem a pilha (testes/regras-planejar.test.ts)',
    3: 'teste: descarta a mão, compra quatro e as suas criaturas ganham +1/+0 por carta descartada; as que chegam depois, não',
    4: 'teste: planejada e conjurada no turno seguinte sem pagar o custo de mana',
    5: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe outro custo alternativo; custos adicionais continuam (motor/stack.ts)',
    6: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts, AltCastDef.free)',
  },
});
